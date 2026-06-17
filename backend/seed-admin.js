/**
 * Run once to create the first admin user:
 *   node seed-admin.js
 */
const sequelize = require('./config/database');
const { User }   = require('./models/index');
require('dotenv').config();

(async () => {
  await sequelize.sync({ alter: true });

  const exists = await User.findOne({ where: { email: 'admin@storerate.com' } });
  if (exists) {
    console.log('Admin already exists.');
    process.exit(0);
  }

  await User.create({
    name:     'System Administrator Account',
    email:    'admin@storerate.com',
    password: 'Admin@123',
    address:  'Platform Headquarters, System Level Administration',
    role:     'admin',
  });

  console.log('✅ Admin created:');
  console.log('   Email:    admin@storerate.com');
  console.log('   Password: Admin@123');
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });

console.log({
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASS,
});