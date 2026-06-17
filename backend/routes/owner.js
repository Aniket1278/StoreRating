const express = require('express');
const { Rating, Store, User } = require('../models/index');
const { protect, authorize }  = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('store_owner'));

// ─── GET /api/owner/dashboard ─────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const store = await Store.findByPk(req.user.storeId);
    if (!store) return res.status(404).json({ message: 'Store not found for this owner' });

    // Fetch ratings with the rating user's name/email via the association
    const ratings = await Rating.findAll({
      where: { storeId: store.id },
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
    });

    res.json({
      store: {
        name: store.name,
        address: store.address,
        averageRating: parseFloat(store.averageRating),
        totalRatings: store.totalRatings,
      },
      ratings: ratings.map(r => ({
        userName:  r.user?.name  ?? 'Deleted User',
        userEmail: r.user?.email ?? '—',
        value:     r.value,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
