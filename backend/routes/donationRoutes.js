// Add or update this route in your donation routes file
router.post('/charities/:id/donations', auth, async (req, res) => {
  try {
    const { amount, transaction_hash, blockchain_verified, message } = req.body;
    const charityId = req.params.id;
    const userId = req.user.id;

    // Validate inputs
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid donation amount' });
    }

    // Create donation record in MySQL
    const donation = await Donation.create({
      user_id: userId,
      charity_id: charityId,
      amount: amount,
      transaction_hash: transaction_hash || null,
      blockchain_verified: blockchain_verified || false,
      message: message || '',
      status: 'completed',
      created_at: new Date()
    });

    // Update charity's received funds
    const charity = await Charity.findByPk(charityId);
    if (charity) {
      charity.fund_received = parseFloat(charity.fund_received || 0) + parseFloat(amount);
      await charity.save();
    }

    return res.status(201).json({
      message: 'Donation recorded successfully',
      donation: donation
    });
  } catch (error) {
    console.error('Error recording donation:', error);
    return res.status(500).json({ message: 'Failed to record donation' });
  }
});

// Add this route to check donations
router.get('/charities/:id/donations', async (req, res) => {
  try {
    const charityId = req.params.id;
    
    // Log for debugging
    console.log(`Fetching donations for charity ID: ${charityId}`);
    
    const donations = await Donation.findAll({
      where: { charity_id: charityId },
      order: [['created_at', 'DESC']],
      include: [
        { model: User, attributes: ['id', 'name', 'email'] }
      ]
    });
    
    console.log(`Found ${donations.length} donations`);
    
    return res.status(200).json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    return res.status(500).json({ message: 'Failed to fetch donations' });
  }
});

// Test route to create a donation
router.get('/test-donation/:charityId', async (req, res) => {
  try {
    const charityId = req.params.charityId;
    
    // Create a test donation
    const donation = await Donation.create({
      user_id: 1, // Use a valid user ID
      charity_id: charityId,
      amount: 0.01,
      transaction_hash: `test-${Date.now()}`,
      blockchain_verified: true,
      message: 'Test donation',
      status: 'completed',
      created_at: new Date()
    });
    
    // Update charity's received funds
    const charity = await Charity.findByPk(charityId);
    if (charity) {
      charity.fund_received = parseFloat(charity.fund_received || 0) + 0.01;
      await charity.save();
    }
    
    return res.status(200).json({
      message: 'Test donation created successfully',
      donation: donation
    });
  } catch (error) {
    console.error('Error creating test donation:', error);
    return res.status(500).json({ message: 'Failed to create test donation', error: error.message });
  }
});

// Add a route to check all donations
router.get('/donations/all', async (req, res) => {
  try {
    const donations = await Donation.findAll({
      order: [['created_at', 'DESC']],
      limit: 100
    });
    
    return res.status(200).json({
      count: donations.length,
      donations: donations
    });
  } catch (error) {
    console.error('Error fetching all donations:', error);
    return res.status(500).json({ message: 'Failed to fetch donations' });
  }
});

// Add a new route specifically for blockchain donations
router.post('/blockchain-donations', async (req, res) => {
  try {
    const { charity_id, amount, transaction_hash, message } = req.body;
    
    console.log("Received blockchain donation:", {
      charity_id,
      amount,
      transaction_hash,
      message
    });
    
    if (!charity_id || !amount || !transaction_hash) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['charity_id', 'amount', 'transaction_hash']
      });
    }
    
    // Create donation record
    const donation = await Donation.create({
      user_id: req.user?.id || null, // Make user_id optional
      charity_id: charity_id,
      amount: amount,
      transaction_hash: transaction_hash,
      blockchain_verified: true,
      message: message || '',
      status: 'completed',
      created_at: new Date()
    });
    
    // Update charity's received funds
    const charity = await Charity.findByPk(charity_id);
    if (charity) {
      charity.fund_received = parseFloat(charity.fund_received || 0) + parseFloat(amount);
      await charity.save();
    }
    
    return res.status(201).json({
      message: 'Blockchain donation recorded successfully',
      donation: donation
    });
  } catch (error) {
    console.error('Error recording blockchain donation:', error);
    return res.status(500).json({ 
      message: 'Failed to record blockchain donation',
      error: error.message
    });
  }
});

// Add a new route specifically for blockchain donations without auth
router.post('/blockchain-donations-noauth', async (req, res) => {
  try {
    const { charity_id, amount, transaction_hash, message } = req.body;
    
    console.log("Received blockchain donation (no auth):", {
      charity_id,
      amount,
      transaction_hash,
      message
    });
    
    if (!charity_id || !amount || !transaction_hash) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['charity_id', 'amount', 'transaction_hash']
      });
    }
    
    // Create donation record
    const donation = await Donation.create({
      user_id: null, // No user ID since no auth
      charity_id: charity_id,
      amount: amount,
      transaction_hash: transaction_hash,
      blockchain_verified: true,
      message: message || '',
      status: 'completed',
      created_at: new Date()
    });
    
    // Update charity's received funds
    const charity = await Charity.findByPk(charity_id);
    if (charity) {
      charity.fund_received = parseFloat(charity.fund_received || 0) + parseFloat(amount);
      await charity.save();
    }
    
    return res.status(201).json({
      message: 'Blockchain donation recorded successfully (no auth)',
      donation: donation
    });
  } catch (error) {
    console.error('Error recording blockchain donation:', error);
    return res.status(500).json({ 
      message: 'Failed to record blockchain donation',
      error: error.message
    });
  }
}); 