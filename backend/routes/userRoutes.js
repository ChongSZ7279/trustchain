// Get user rewards
router.get('/rewards', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch user's reward points and history from database
    const user = await User.findById(userId).select('rewardPoints');
    const rewardHistory = await RewardTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      points: user.rewardPoints,
      rewardHistory
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Redeem a reward
router.post('/rewards/redeem', authMiddleware, async (req, res) => {
  try {
    const { rewardId } = req.body;
    const userId = req.user.id;
    
    // Get reward details
    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }
    
    // Check if user has enough points
    const user = await User.findById(userId);
    if (user.rewardPoints < reward.points) {
      return res.status(400).json({ message: 'Not enough points' });
    }
    
    // Deduct points and create transaction record
    user.rewardPoints -= reward.points;
    await user.save();
    
    await RewardTransaction.create({
      userId,
      rewardId,
      name: reward.name,
      points: reward.points,
      redeemedAt: new Date()
    });
    
    res.json({
      message: 'Reward redeemed successfully',
      updatedPoints: user.rewardPoints
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get followed charities
router.get('/followed-charities', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all charity follows for this user
    const follows = await CharityFollow.find({ userId })
      .populate('charityId', 'name description imageUrl');
    
    // Get updates from followed charities
    const followedCharityIds = follows.map(follow => follow.charityId._id);
    const updates = await CharityUpdate.find({ 
      charityId: { $in: followedCharityIds } 
    })
    .populate('charityId', 'name logo')
    .sort({ createdAt: -1 })
    .limit(20);
    
    // Format the updates
    const formattedUpdates = updates.map(update => ({
      id: update._id,
      charityId: update.charityId._id,
      charityName: update.charityId.name,
      charityLogo: update.charityId.logo,
      content: update.content,
      date: update.createdAt,
      link: update.link
    }));
    
    // Format the charities
    const followedCharities = follows.map(follow => ({
      id: follow.charityId._id,
      name: follow.charityId.name,
      description: follow.charityId.description,
      imageUrl: follow.charityId.imageUrl
    }));
    
    res.json({
      followedCharities,
      updates: formattedUpdates
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}); 