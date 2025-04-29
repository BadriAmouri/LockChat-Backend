// routes/users.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware'); // Middleware to check auth
const UserController = require('../controllers/UserController');

router.get('/searchUsers', authenticate, UserController.searchForUsers);

module.exports = router;
