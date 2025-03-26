// Check if user is following a charity
router.get('/:id/follow-status', authMiddleware, async (req, res) => {
  try {
    const charityId = req.params.id;
    const userId = req.user.id;
    
    // Check if follow relationship exists
    const follow = await CharityFollow.findOne({ userId, charityId });
    
    // Count total followers
    const followerCount = await CharityFollow.countDocuments({ charityId });
    
    res.json({
      isFollowing: !!follow,
      followerCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow a charity
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const charityId = req.params.id;
    const userId = req.user.id;
    
    // Check if already following
    const existingFollow = await CharityFollow.findOne({ userId, charityId });
    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this charity' });
    }
    
    // Create follow relationship
    await CharityFollow.create({ userId, charityId });
    
    // Get updated follower count
    const updatedFollowerCount = await CharityFollow.countDocuments({ charityId });
    
    res.json({
      message: 'Successfully followed charity',
      updatedFollowerCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow a charity
router.post('/:id/unfollow', authMiddleware, async (req, res) => {
  try {
    const charityId = req.params.id;
    const userId = req.user.id;
    
    // Delete follow relationship
    await CharityFollow.findOneAndDelete({ userId, charityId });
    
    // Get updated follower count
    const updatedFollowerCount = await CharityFollow.countDocuments({ charityId });
    
    res.json({
      message: 'Successfully unfollowed charity',
      updatedFollowerCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}); 