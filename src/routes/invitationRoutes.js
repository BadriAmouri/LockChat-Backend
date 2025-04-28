const express = require('express');
const InvitationController = require('../controllers/invitationController');
const authenticate = require('../middleware/authMiddleware'); // Middleware to check auth

const router = express.Router();

router.post('/Invitations/sendInvitation', authenticate, InvitationController.sendInvitation);
router.get('/Invitations/getPendingInvitations', authenticate, InvitationController.getMyPendingInvitations);
router.post('/Invitations/:invitationId/respond', authenticate, InvitationController.respondToInvitation);

module.exports = router;
