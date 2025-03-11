/**
 * Reward tiers based on total donation amount
 */
export const REWARD_TIERS = [
  { name: 'Bronze', minAmount: 0, maxAmount: 99, image: '/src/assets/image/Bronze.png', color: '#CD7F32' },
  { name: 'Silver', minAmount: 100, maxAmount: 499, image: '/src/assets/image/Silver.png', color: '#C0C0C0' },
  { name: 'Gold', minAmount: 500, maxAmount: 999, image: '/src/assets/image/Gold.png', color: '#FFD700' },
  { name: 'Platinum', minAmount: 1000, maxAmount: 4999, image: '/src/assets/image/Platinum.png', color: '#E5E4E2' },
  { name: 'Diamond', minAmount: 5000, maxAmount: Infinity, image: '/src/assets/image/Diamond.png', color: '#B9F2FF' }
];

/**
 * Calculate the user's reward tier based on their total donation amount
 * @param {number} totalDonationAmount - The user's total donation amount
 * @returns {Object} The reward tier object
 */
export const calculateRewardTier = (totalDonationAmount) => {
  return REWARD_TIERS.find(
    tier => totalDonationAmount >= tier.minAmount && totalDonationAmount <= tier.maxAmount
  ) || REWARD_TIERS[0]; // Default to Bronze if no tier matches
};

/**
 * Calculate the progress to the next tier
 * @param {number} totalDonationAmount - The user's total donation amount
 * @returns {Object} Object containing the next tier and progress percentage
 */
export const calculateNextTierProgress = (totalDonationAmount) => {
  const currentTier = calculateRewardTier(totalDonationAmount);
  const currentTierIndex = REWARD_TIERS.findIndex(tier => tier.name === currentTier.name);
  
  // If user is already at the highest tier
  if (currentTierIndex === REWARD_TIERS.length - 1) {
    return {
      nextTier: null,
      progress: 100,
      amountToNextTier: 0
    };
  }
  
  const nextTier = REWARD_TIERS[currentTierIndex + 1];
  const amountToNextTier = nextTier.minAmount - totalDonationAmount;
  const tierRange = nextTier.minAmount - currentTier.minAmount;
  const progress = ((totalDonationAmount - currentTier.minAmount) / tierRange) * 100;
  
  return {
    nextTier,
    progress: Math.min(Math.max(progress, 0), 100), // Ensure progress is between 0 and 100
    amountToNextTier
  };
};

/**
 * Get achievements based on donation history
 * @param {Array} transactions - The user's transaction history
 * @returns {Array} List of achievements earned
 */
export const getAchievements = (transactions) => {
  const achievements = [];
  
  // Filter only completed donations
  const completedDonations = transactions.filter(
    tx => tx.type === 'charity' && tx.status === 'completed'
  );
  
  // First donation achievement
  if (completedDonations.length >= 1) {
    achievements.push({
      id: 'first_donation',
      name: 'First Steps',
      description: 'Made your first donation',
      icon: '🎉'
    });
  }
  
  // 5 donations achievement
  if (completedDonations.length >= 5) {
    achievements.push({
      id: 'five_donations',
      name: 'Regular Contributor',
      description: 'Made 5 or more donations',
      icon: '🌟'
    });
  }
  
  // 10 donations achievement
  if (completedDonations.length >= 10) {
    achievements.push({
      id: 'ten_donations',
      name: 'Dedicated Supporter',
      description: 'Made 10 or more donations',
      icon: '🏆'
    });
  }
  
  // Big donation achievement (single donation of $500 or more)
  const hasBigDonation = completedDonations.some(tx => parseFloat(tx.amount) >= 500);
  if (hasBigDonation) {
    achievements.push({
      id: 'big_donation',
      name: 'Big Heart',
      description: 'Made a single donation of $500 or more',
      icon: '💖'
    });
  }
  
  // Diverse donor achievement (donated to 3 or more different charities)
  const uniqueCharities = new Set(completedDonations.map(tx => tx.charity_id)).size;
  if (uniqueCharities >= 3) {
    achievements.push({
      id: 'diverse_donor',
      name: 'Diverse Supporter',
      description: 'Donated to 3 or more different charities',
      icon: '🌈'
    });
  }
  
  return achievements;
};

/**
 * Calculate the total donation amount from transaction history
 * @param {Array} transactions - The user's transaction history
 * @returns {number} Total donation amount
 */
export const calculateTotalDonationAmount = (transactions) => {
  return transactions
    .filter(tx => (tx.type === 'charity' || tx.type === 'task') && tx.status === 'completed')
    .reduce((total, tx) => total + parseFloat(tx.amount), 0);
}; 