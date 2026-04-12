const express = require('express');
const router = express.Router();

router.get('/simple-users', (req, res) => {
  res.json({ message: 'Simple users test endpoint' });
});

router.get('/simple-test', (req, res) => {
  res.json({ message: 'Simple test endpoint' });
});

module.exports = router;
