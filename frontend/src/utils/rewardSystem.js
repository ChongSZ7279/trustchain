/**
 * Reward system utility functions
 * This file contains functions for calculating reward tiers, achievements, and donation totals
 */

// Define reward tiers with all necessary properties
export const rewardTiers = [
  { 
    id: 'bronze', 
    name: 'Bronze Donor', 
    threshold: 0, 
    icon: 'bronze',
    color: 'bg-yellow-100 text-yellow-800',
    benefits: [
      'Access to donor-only updates',
      'Recognition on our website'
    ]
  },
  { 
    id: 'silver', 
    name: 'Silver Donor', 
    threshold: 100, 
    icon: 'silver',
    color: 'bg-gray-100 text-gray-800',
    benefits: [
      'Access to donor-only updates',
      'Recognition on our website',
      'Exclusive newsletter subscription'
    ]
  },
  { 
    id: 'gold', 
    name: 'Gold Donor', 
    threshold: 500, 
    icon: 'gold',
    color: 'bg-yellow-100 text-yellow-800',
    benefits: [
      'Access to donor-only updates',
      'Recognition on our website',
      'Exclusive newsletter subscription',
      'Invitation to annual donor event'
    ]
  },
  { 
    id: 'platinum', 
    name: 'Platinum Donor', 
    threshold: 1000, 
    icon: 'platinum',
    color: 'bg-indigo-100 text-indigo-800',
    benefits: [
      'Access to donor-only updates',
      'Recognition on our website',
      'Exclusive newsletter subscription',
      'Invitation to annual donor event',
      'Personalized thank you from our team'
    ]
  },
  { 
    id: 'diamond', 
    name: 'Diamond Donor', 
    threshold: 5000, 
    icon: 'diamond',
    color: 'bg-blue-100 text-blue-800',
    benefits: [
      'Access to donor-only updates',
      'Recognition on our website',
      'Exclusive newsletter subscription',
      'Invitation to annual donor event',
      'Personalized thank you from our team',
      'VIP access to special events',
      'Custom donor profile badge'
    ]
  }
];

// Define achievements
export const achievementsList = [
  { id: 'first_donation', name: 'First Steps', description: 'Make your first donation' },
  { id: 'donate_3_charities', name: 'Generous Heart', description: 'Donate to 3 different charities' },
  { id: 'donate_10_charities', name: 'Community Pillar', description: 'Donate to 10 different charities' },
  { id: 'donate_100', name: 'Century Club', description: 'Donate a total of $100' },
  { id: 'donate_500', name: 'Major Contributor', description: 'Donate a total of $500' },
  { id: 'donate_1000', name: 'Platinum Donor', description: 'Donate a total of $1,000' },
  { id: 'follow_5_orgs', name: 'Connected', description: 'Follow 5 organizations' },
  { id: 'follow_5_charities', name: 'Charity Supporter', description: 'Follow 5 charities' },
  { id: 'complete_profile', name: 'Identity', description: 'Complete your profile information' },
];

/**
 * Calculate total donation amount
 * @param {Array} transactions - The user's transaction history
 * @returns {number} Total donation amount
 */
export const calculateTotalDonationAmount = (transactions) => {
  if (!transactions || !Array.isArray(transactions)) {
    return 0;
  }
  
  return transactions.reduce((total, tx) => {
    // Only count completed donations
    if (tx.status === 'completed') {
      return total + (parseFloat(tx.amount) || 0);
    }
    return total;
  }, 0);
};

/**
 * Calculate the user's reward tier based on their total donation amount
 * @param {number} totalAmount - The user's total donation amount
 * @returns {Object} The reward tier object
 */
export const calculateRewardTier = (totalAmount) => {
  // Find the highest tier the user qualifies for
  for (let i = rewardTiers.length - 1; i >= 0; i--) {
    if (totalAmount >= rewardTiers[i].threshold) {
      return rewardTiers[i];
    }
  }
  return rewardTiers[0]; // Default to bronze
};

/**
 * Calculate the progress to the next tier
 * @param {number} totalAmount - The user's total donation amount
 * @returns {Object} Object containing the next tier and progress percentage
 */
export const calculateNextTierProgress = (totalAmount) => {
  const currentTier = calculateRewardTier(totalAmount);
  const currentTierIndex = rewardTiers.findIndex(tier => tier.id === currentTier.id);
  
  // If user is at the highest tier
  if (currentTierIndex === rewardTiers.length - 1) {
    return {
      percentage: 100,
      remaining: 0,
      nextTier: null
    };
  }
  
  const nextTier = rewardTiers[currentTierIndex + 1];
  const remaining = nextTier.threshold - totalAmount;
  const tierRange = nextTier.threshold - currentTier.threshold;
  const progress = totalAmount - currentTier.threshold;
  const percentage = Math.min(100, Math.round((progress / tierRange) * 100));
  
  return {
    percentage,
    remaining,
    nextTier: nextTier.name
  };
};

/**
 * Get achievements based on user's transactions
 * @param {Array} transactions - The user's transaction history
 * @returns {Array} List of achievements earned
 */
export const getAchievements = (transactions) => {
  if (!transactions || !Array.isArray(transactions)) {
    return [];
  }
  
  const achievements = [];
  
  // Check for first donation
  if (transactions.length > 0) {
    achievements.push({ id: 'first_donation', name: 'First Steps', description: 'Make your first donation' });
  }
  
  // Count unique charities
  const uniqueCharities = new Set();
  transactions.forEach(tx => {
    if (tx.charity_id) {
      uniqueCharities.add(tx.charity_id);
    }
  });
  
  // Check for 3 charities
  if (uniqueCharities.size >= 3) {
    achievements.push({ id: 'donate_3_charities', name: 'Generous Heart', description: 'Donate to 3 different charities' });
  }
  
  // Check for 10 charities
  if (uniqueCharities.size >= 10) {
    achievements.push({ id: 'donate_10_charities', name: 'Community Pillar', description: 'Donate to 10 different charities' });
  }
  
  // Calculate total donation amount
  const totalAmount = calculateTotalDonationAmount(transactions);
  
  // Check for donation thresholds
  if (totalAmount >= 100) {
    achievements.push({ id: 'donate_100', name: 'Century Club', description: 'Donate a total of $100' });
  }
  
  if (totalAmount >= 500) {
    achievements.push({ id: 'donate_500', name: 'Major Contributor', description: 'Donate a total of $500' });
  }
  
  if (totalAmount >= 1000) {
    achievements.push({ id: 'donate_1000', name: 'Platinum Donor', description: 'Donate a total of $1,000' });
  }
  
  return achievements;
};

// For backward compatibility
export const REWARD_TIERS = [
  { name: 'Bronze', minAmount: 0, maxAmount: 99, image: '/src/assets/image/Bronze.png', color: '#CD7F32' },
  { name: 'Silver', minAmount: 100, maxAmount: 499, image: '/src/assets/image/Silver.png', color: '#C0C0C0' },
  { name: 'Gold', minAmount: 500, maxAmount: 999, image: '/src/assets/image/Gold.png', color: '#FFD700' },
  { name: 'Platinum', minAmount: 1000, maxAmount: 4999, image: '/src/assets/image/Platinum.png', color: '#E5E4E2' },
  { name: 'Diamond', minAmount: 5000, maxAmount: Infinity, image: '/src/assets/image/Diamond.png', color: '#B9F2FF' }
]; 