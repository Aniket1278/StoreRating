const express    = require('express');
const cors       = require('cors');
const dotenv     = require('dotenv');
const sequelize  = require('./config/database');
require('dotenv').config();
// Load models (registers associations)
require('./models/index');

dotenv.config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/admin',   require('./routes/admin'));
app.use('/api/stores',  require('./routes/stores'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/owner',   require('./routes/owner'));

app.get('/', (req, res) => res.json({ message: 'Store Rating API is running (MySQL)' }));

// ─── Sync DB then start server ────────────────────────────────────────────────
sequelize.sync({ alter: true }) // alter: true updates tables without dropping data
  .then(() => {
    console.log('✅ MySQL connected & tables synced');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('❌ MySQL connection error:', err);
    process.exit(1);
  });
