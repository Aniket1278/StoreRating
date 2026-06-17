require('dotenv').config();
const { Sequelize } = require('sequelize');

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbHost = process.env.DB_HOST;

console.log("Database config being used:");
console.log({
    dbName,
    dbUser,
    dbPass,
    dbHost
});

const sequelize = new Sequelize(
    dbName,
    dbUser,
    dbPass,
    {
        host: dbHost,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: console.log,
    }
);

sequelize.authenticate()
    .then(() => console.log("✅ Sequelize authenticate successful"))
    .catch(err => console.error("❌ Authenticate failed:", err));

module.exports = sequelize;