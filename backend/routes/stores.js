const express        = require('express');
const { Op }         = require('sequelize');
const { Store, Rating } = require('../models/index');
const { protect }    = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ─── GET /api/stores ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { name, address, sortBy = 'name', order = 'ASC' } = req.query;

    const where = {};
    if (name)    where.name    = { [Op.like]: `%${name}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };

    const validSortFields = ['name', 'address', 'averageRating', 'totalRatings'];
    const safeSort  = validSortFields.includes(sortBy) ? sortBy : 'name';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const stores = await Store.findAll({ where, order: [[safeSort, safeOrder]] });

    // Fetch all ratings by this user in one query, build a lookup map
    const userRatings = await Rating.findAll({ where: { userId: req.user.id } });
    const ratingMap = {};
    userRatings.forEach(r => { ratingMap[r.storeId] = r.value; });

    const enriched = stores.map(s => ({
      ...s.toJSON(),
      userRating: ratingMap[s.id] ?? null,
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
