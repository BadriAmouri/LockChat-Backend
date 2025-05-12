const express = require('express');
const router = express.Router();
const profilePicController = require('../controllers/profilePicController');

router.post('/upload-profile-picture', profilePicController.uploadMiddleware, profilePicController.uploadProfilePicture);

module.exports = router;
