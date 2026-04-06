// Broadcast (send message)
router.post('/broadcast/send', auth, async (req, res) => {
  try {
    const { event, message, channel } = req.body;
    // TODO: integrate with messaging provider
    res.json({ message: 'Broadcast sent (mock)', event, channel });
  } catch (error) {
    res.status(500).json({ message: 'Could not send broadcast' });
  }
});

// Subscribe system
router.post('/subscribers/add', auth, async (req, res) => {
  try {
    const { event, email } = req.body;
    // TODO: save subscriber to DB (model not yet created)
    res.json({ message: 'Subscriber added (mock)', event, email });
  } catch (error) {
    res.status(500).json({ message: 'Could not add subscriber' });
  }
});

// Partnership sales
router.post('/partners/create', auth, async (req, res) => {
  try {
    const { event, partnerName, sales } = req.body;
    // TODO: save partner sales to DB (model not yet created)
    res.json({ message: 'Partner sales tracked (mock)', event, partnerName, sales });
  } catch (error) {
    res.status(500).json({ message: 'Could not track partner sales' });
  }
});
const express = require('express');
const auth = require('../middleware/auth');
const Offer = require('../models/Offer');
const Coupon = require('../models/Coupon');

const router = express.Router();

// Create offer
router.post('/offers/create', auth, async (req, res) => {
  try {
    const { event, title, description, discount, code, validFrom, validTo } = req.body;
    const offer = await Offer.create({
      event,
      organizer: req.user.id,
      title,
      description,
      discount,
      code,
      validFrom,
      validTo,
    });
    res.json({ message: 'Offer created', offer });
  } catch (error) {
    res.status(500).json({ message: 'Could not create offer' });
  }
});

// Create coupon
router.post('/coupons/create', auth, async (req, res) => {
  try {
    const { event, code, discount, validFrom, validTo, maxUsage } = req.body;
    const coupon = await Coupon.create({
      event,
      organizer: req.user.id,
      code,
      discount,
      validFrom,
      validTo,
      maxUsage,
    });
    res.json({ message: 'Coupon created', coupon });
  } catch (error) {
    res.status(500).json({ message: 'Could not create coupon' });
  }
});

module.exports = router;
