const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const Rating = sequelize.define('Rating', {
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  userId: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  storeId: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  value: {
    type:      DataTypes.INTEGER,
    allowNull: false,
    validate:  { min: 1, max: 5 },
  },
}, {
  tableName:  'ratings',
  timestamps: true,
  indexes: [
    // Enforce one rating per user per store at DB level
    { unique: true, fields: ['userId', 'storeId'] },
  ],
});

module.exports = Rating;
