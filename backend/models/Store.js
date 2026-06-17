const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const Store = sequelize.define('Store', {
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  name: {
    type:      DataTypes.STRING(60),
    allowNull: false,
    validate: {
      len: { args: [20, 60], msg: 'Name must be 20–60 characters' },
    },
  },
  email: {
    type:      DataTypes.STRING(255),
    allowNull: false,
    unique:    true,
    validate:  { isEmail: { msg: 'Invalid email address' } },
  },
  address: {
    type:      DataTypes.STRING(400),
    allowNull: false,
  },
  // Denormalized: recalculated on every rating change for fast reads
  averageRating: {
    type:         DataTypes.DECIMAL(3, 1),
    defaultValue: 0,
  },
  totalRatings: {
    type:         DataTypes.INTEGER,
    defaultValue: 0,
  },
  // FK to owner user
  ownerId: {
    type:         DataTypes.INTEGER,
    allowNull:    true,
    defaultValue: null,
  },
}, {
  tableName:  'stores',
  timestamps: true,
});

module.exports = Store;
