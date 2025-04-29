const express = require('express');
const router = express.Router();
const { checkUserConnection } = require('../websocket/websocket');

router.post('/api/websocket/check-user-connection', (req, res) => {
  const { userId } = req.body;
  const isConnected = checkUserConnection(userId);
  res.status(200).json({ isConnected });
});

module.exports = router;
