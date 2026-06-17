const express  = require('express');
const { Op }   = require('sequelize');
const { body, validationResult } = require('express-validator');
const { User, Store, Rating } = require('../models/index');
const { protect, authorize }  = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('admin'));

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.count({ where: { role: { [Op.in]: ['user', 'store_owner'] } } }),
      Store.count(),
      Rating.count(),
    ]);
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', order = 'ASC' } = req.query;

    const where = {};
    if (name)    where.name    = { [Op.like]: `%${name}%` };
    if (email)   where.email   = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };
    if (role)    where.role    = role;

    const validSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const safeSort  = validSortFields.includes(sortBy) ? sortBy : 'name';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [[safeSort, safeOrder]],
    });

    // Attach store rating for store owners
    const enriched = await Promise.all(users.map(async (u) => {
      const plain = u.toJSON();
      if (plain.role === 'store_owner' && plain.storeId) {
        const store = await Store.findByPk(plain.storeId, {
          attributes: ['averageRating'],
        });
        plain.storeRating = store ? parseFloat(store.averageRating) : 0;
      }
      return plain;
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── POST /api/admin/users ────────────────────────────────────────────────────
router.post('/users', [
  body('name').trim().isLength({ min: 20, max: 60 }),
  body('email').isEmail(),
  body('address').trim().isLength({ max: 400 }),
  body('password')
    .isLength({ min: 8, max: 16 })
    .matches(/[A-Z]/)
    .matches(/[^A-Za-z0-9]/),
  body('role').isIn(['admin', 'user', 'store_owner']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, address, password, role } = req.body;
  try {
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, address, password, role });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── GET /api/admin/stores ────────────────────────────────────────────────────
router.get('/stores', async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', order = 'ASC' } = req.query;

    const where = {};
    if (name)    where.name    = { [Op.like]: `%${name}%` };
    if (email)   where.email   = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };

    const validSortFields = ['name', 'email', 'address', 'averageRating', 'totalRatings', 'createdAt'];
    const safeSort  = validSortFields.includes(sortBy) ? sortBy : 'name';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const stores = await Store.findAll({
      where,
      order: [[safeSort, safeOrder]],
    });
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── POST /api/admin/stores ───────────────────────────────────────────────────
router.post('/stores', [
  body('name').trim().isLength({ min: 20, max: 60 }),
  body('email').isEmail(),
  body('address').trim().isLength({ max: 400 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, address, ownerEmail } = req.body;
  try {
    let ownerId = null;
    if (ownerEmail) {
      const owner = await User.findOne({ where: { email: ownerEmail, role: 'store_owner' } });
      if (!owner) return res.status(404).json({ message: 'Store owner not found' });
      ownerId = owner.id;
    }

    const store = await Store.create({ name, email, address, ownerId });

    // Link store back to owner user
    if (ownerId) {
      await User.update({ storeId: store.id }, { where: { id: ownerId } });
    }

    res.status(201).json(store);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
