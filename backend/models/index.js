// Central place to define associations and export all models
const User   = require('./User');
const Store  = require('./Store');
const Rating = require('./Rating');

// ── Associations ──────────────────────────────────────────────────────────────
// A store has many ratings; a rating belongs to one store
Store.hasMany(Rating,  { foreignKey: 'storeId', as: 'ratings', onDelete: 'CASCADE' });
Rating.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

// A user has many ratings; a rating belongs to one user
User.hasMany(Rating,   { foreignKey: 'userId',  as: 'ratings', onDelete: 'CASCADE' });
Rating.belongsTo(User,  { foreignKey: 'userId',  as: 'user' });

// A store_owner user optionally belongs to one store
User.belongsTo(Store,  { foreignKey: 'storeId', as: 'ownedStore' });
Store.belongsTo(User,  { foreignKey: 'ownerId', as: 'owner' });

module.exports = { User, Store, Rating };
