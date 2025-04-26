const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Donation = require('./Donation');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  frequency: {
    type: DataTypes.ENUM('weekly', 'biweekly', 'monthly', 'quarterly'),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('scroll', 'transak'),
    allowNull: false
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'cancelled'),
    defaultValue: 'active'
  },
  lastPaymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextPaymentDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  walletAddress: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

// Define relationships
Subscription.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Subscription, { foreignKey: 'userId' });

module.exports = Subscription;