const express = require('express');
const router = express.Router();
const SchoolUser = require('../models/schoolUser.model');

// GET /api/users/schoolusers/:email
router.get('/schoolusers/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await SchoolUser.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching school user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;