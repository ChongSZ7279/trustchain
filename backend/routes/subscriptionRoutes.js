const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a new subscription
router.post('/', subscriptionController.createSubscription);

// Get user's subscriptions
router.get('/user', subscriptionController.getUserSubscriptions);

// Update subscription status
router.patch('/:subscriptionId/status', subscriptionController.updateSubscriptionStatus);

module.exports = router;