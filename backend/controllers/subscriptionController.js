const Subscription = require('../models/Subscription');
const Donation = require('../models/Donation');
const { Op } = require('sequelize');

// Create a new subscription
exports.createSubscription = async (req, res) => {
  try {
    const {
      organizationId,
      amount,
      frequency,
      paymentMethod,
      isAnonymous,
      message,
      walletAddress
    } = req.body;

    // Calculate next payment date based on frequency
    const nextPaymentDate = calculateNextPaymentDate(frequency);

    const subscription = await Subscription.create({
      userId: req.user.id,
      organizationId,
      amount,
      frequency,
      paymentMethod,
      isAnonymous,
      message,
      walletAddress,
      nextPaymentDate
    });

    // Create initial donation
    const donation = await Donation.create({
      userId: req.user.id,
      organizationId,
      amount,
      paymentMethod,
      isAnonymous,
      message,
      transactionHash: `sub_${subscription.id}_${Date.now()}`,
      subscriptionId: subscription.id
    });

    res.status(201).json({
      success: true,
      data: {
        subscription,
        donation
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription'
    });
  }
};

// Get user's subscriptions
exports.getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      where: {
        userId: req.user.id,
        status: 'active'
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscriptions'
    });
  }
};

// Update subscription status
exports.updateSubscriptionStatus = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { status } = req.body;

    const subscription = await Subscription.findOne({
      where: {
        id: subscriptionId,
        userId: req.user.id
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    subscription.status = status;
    await subscription.save();

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update subscription'
    });
  }
};

// Helper function to calculate next payment date
function calculateNextPaymentDate(frequency) {
  const now = new Date();
  switch (frequency) {
    case 'weekly':
      return new Date(now.setDate(now.getDate() + 7));
    case 'biweekly':
      return new Date(now.setDate(now.getDate() + 14));
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1));
    case 'quarterly':
      return new Date(now.setMonth(now.getMonth() + 3));
    default:
      return new Date(now.setMonth(now.getMonth() + 1));
  }
}

// Process recurring payments (to be called by a cron job)
exports.processRecurringPayments = async () => {
  try {
    const today = new Date();
    const subscriptions = await Subscription.findAll({
      where: {
        status: 'active',
        nextPaymentDate: {
          [Op.lte]: today
        }
      }
    });

    for (const subscription of subscriptions) {
      try {
        // Create donation record
        await Donation.create({
          userId: subscription.userId,
          organizationId: subscription.organizationId,
          amount: subscription.amount,
          paymentMethod: subscription.paymentMethod,
          isAnonymous: subscription.isAnonymous,
          message: subscription.message,
          transactionHash: `sub_${subscription.id}_${Date.now()}`,
          subscriptionId: subscription.id
        });

        // Update subscription payment dates
        subscription.lastPaymentDate = today;
        subscription.nextPaymentDate = calculateNextPaymentDate(subscription.frequency);
        await subscription.save();
      } catch (error) {
        console.error(`Error processing subscription ${subscription.id}:`, error);
        // Continue with next subscription even if one fails
      }
    }
  } catch (error) {
    console.error('Error processing recurring payments:', error);
  }
};