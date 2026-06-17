const { DataTypes } = require('sequelize');
const bcrypt        = require('bcryptjs');
const sequelize     = require('../config/database');

const User = sequelize.define('User', {
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
  password: {
    type:      DataTypes.STRING(255),
    allowNull: false,
  },
  address: {
    type:      DataTypes.STRING(400),
    allowNull: false,
    validate: {
      len: { args: [1, 400], msg: 'Address must be at most 400 characters' },
    },
  },
  role: {
    type:         DataTypes.ENUM('admin', 'user', 'store_owner'),
    defaultValue: 'user',
    allowNull:    false,
  },
  // FK to stores — set after store is created for store_owner
  storeId: {
    type:         DataTypes.INTEGER,
    allowNull:    true,
    defaultValue: null,
  },
}, {
  tableName:  'users',
  timestamps: true,
  hooks: {
    // Hash password before create or update
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
  },
});

// Instance method — compare plain text with hash
User.prototype.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Strip password from JSON output
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
