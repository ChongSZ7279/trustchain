const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../db');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/verification-docs/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and PDF are allowed.'));
    }
  }
});

// MyKad Verification Routes
router.post('/verify-mykad', authenticateToken, upload.fields([
  { name: 'idImage', maxCount: 1 },
  { name: 'selfieImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { icNumber, fullName } = req.body;
    const userId = req.user.id;

    // In a production environment, you would integrate with JPN (National Registration Department)
    // For demo purposes, we'll simulate the verification
    const verificationResult = await db.one(`
      INSERT INTO user_verifications (
        user_id, 
        ic_number, 
        full_name, 
        id_image_path, 
        selfie_image_path, 
        verification_status,
        verification_date
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id, verification_status
    `, [
      userId,
      icNumber,
      fullName,
      req.files['idImage'][0].path,
      req.files['selfieImage'][0].path,
      'verified'
    ]);

    res.json({
      success: true,
      verification: verificationResult
    });
  } catch (error) {
    console.error('MyKad verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify MyKad'
    });
  }
});

// Milestone Routes
router.post('/milestones/:taskId/complete', authenticateToken, upload.single('verificationDocument'), async (req, res) => {
  try {
    const { taskId } = req.params;
    const { notes } = req.body;
    const organizationId = req.user.organization_id;

    // Verify organization ownership
    const task = await db.one('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (task.organization_id !== organizationId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to complete this milestone'
      });
    }

    // Update milestone status
    const updatedTask = await db.one(`
      UPDATE tasks 
      SET 
        status = 'completed',
        completed_at = CURRENT_TIMESTAMP,
        verification_document = $1,
        verification_notes = $2
      WHERE id = $3
      RETURNING *
    `, [
      req.file ? req.file.path : null,
      notes,
      taskId
    ]);

    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    console.error('Milestone completion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete milestone'
    });
  }
});

// Tax Receipt Routes
router.get('/tax-receipts/:donationId', authenticateToken, async (req, res) => {
  try {
    const { donationId } = req.params;
    const userId = req.user.id;

    const receipt = await db.one(`
      SELECT 
        d.*,
        c.name as charity_name,
        c.registration_number,
        c.tax_exemption_ref,
        u.name as donor_name,
        u.ic_number,
        u.email,
        u.phone,
        u.address
      FROM donations d
      JOIN charities c ON d.charity_id = c.id
      JOIN users u ON d.user_id = u.id
      WHERE d.id = $1 AND d.user_id = $2
    `, [donationId, userId]);

    res.json({
      success: true,
      receipt
    });
  } catch (error) {
    console.error('Tax receipt error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate tax receipt'
    });
  }
});

// SDG Impact Routes
router.get('/sdg-impact/:charityId', async (req, res) => {
  try {
    const { charityId } = req.params;

    // Fetch charity impact data
    const impactData = await db.one(`
      SELECT 
        c.*,
        COUNT(DISTINCT t.id) as total_projects,
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_projects,
        COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as ongoing_projects,
        SUM(d.amount) as total_donations,
        COUNT(DISTINCT d.user_id) as total_donors,
        json_agg(DISTINCT t.region) as regions
      FROM charities c
      LEFT JOIN tasks t ON c.id = t.charity_id
      LEFT JOIN donations d ON c.id = d.charity_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [charityId]);

    res.json({
      success: true,
      impact: impactData
    });
  } catch (error) {
    console.error('SDG impact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch SDG impact data'
    });
  }
});

// Charity Verification Routes
router.get('/charity-verification/:charityId', async (req, res) => {
  try {
    const { charityId } = req.params;

    const verificationData = await db.one(`
      SELECT 
        c.*,
        cv.ssm_status,
        cv.ssm_registration_number,
        cv.ssm_verification_date,
        cv.ssm_expiry_date,
        cv.ros_status,
        cv.ros_registration_number,
        cv.ros_verification_date,
        cv.ros_expiry_date,
        cv.lhdn_status,
        cv.lhdn_registration_number,
        cv.lhdn_verification_date,
        cv.lhdn_expiry_date,
        json_agg(cd.*) as documents
      FROM charities c
      LEFT JOIN charity_verifications cv ON c.id = cv.charity_id
      LEFT JOIN charity_documents cd ON c.id = cd.charity_id
      WHERE c.id = $1
      GROUP BY c.id, cv.id
    `, [charityId]);

    res.json({
      success: true,
      verification: verificationData
    });
  } catch (error) {
    console.error('Charity verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch charity verification data'
    });
  }
});

module.exports = router; 