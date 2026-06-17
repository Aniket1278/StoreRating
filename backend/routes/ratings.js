const express = require('express');
const { body, validationResult } = require('express-validator');
const { Rating, Store } = require('../models/index');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('user'));

// Helper: recalculate and update store's average rating
const recalcStoreRating = async (storeId) => {
  const ratings = await Rating.findAll({ where: { storeId } });
  const total   = ratings.length;
  const avg     = total ? ratings.reduce((sum, r) => sum + r.value, 0) / total : 0;
  await Store.update(
    { averageRating: Math.round(avg * 10) / 10, totalRatings: total },
    { where: { id: storeId } }
  );
};

// ─── POST /api/ratings ────────────────────────────────────────────────────────
router.post('/', [
  body('storeId').notEmpty().withMessage('storeId is required'),
  body('value').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { storeId, value } = req.body;
  try {
    const existing = await Rating.findOne({ where: { userId: req.user.id, storeId } });
    if (existing) return res.status(409).json({ message: 'You already rated this store. Use PUT to update.' });

    const rating = await Rating.create({ userId: req.user.id, storeId, value });
    await recalcStoreRating(storeId);

    res.status(201).json(rating);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── PUT /api/ratings/:storeId ────────────────────────────────────────────────
router.put('/:storeId', [
  body('value').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { storeId } = req.params;
  const { value }   = req.body;

  try {
    const rating = await Rating.findOne({ where: { userId: req.user.id, storeId } });
    if (!rating) return res.status(404).json({ message: 'Rating not found' });

    rating.value = value;
    await rating.save();

    await recalcStoreRating(storeId);
    res.json(rating);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
