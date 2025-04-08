module.exports = (sequelize, DataTypes) => {
  const Donation = sequelize.define('Donation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    charity_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    transaction_hash: {
      type: DataTypes.STRING,
      allowNull: true
    },
    blockchain_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'completed'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'donations',
    timestamps: false
  });

  Donation.associate = (models) => {
    Donation.belongsTo(models.User, { foreignKey: 'user_id' });
    Donation.belongsTo(models.Charity, { foreignKey: 'charity_id' });
  };

  return Donation;
}; 