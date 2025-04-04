const express = require('express');
const ChatroomController = require('../controllers/chatroomController');
const authenticate = require('../middleware/authMiddleware'); // Middleware to check auth

const router = express.Router();

router.get('/chatrooms/getAllChatrooms', authenticate, ChatroomController.getUserChatrooms);
router.get('/chatrooms/:id/messages', authenticate, ChatroomController.getMessagesInChatroom);
router.get('/chatrooms/:id/users', authenticate, ChatroomController.getChatroomUsers);
router.post('/chatrooms/createChatroom', authenticate, ChatroomController.createChatroom);
router.post('/chatrooms/:id/updateChatroom',authenticate,ChatroomController.updateChatroom)
router.post('/chatrooms/:id/addUserToChatroom',authenticate,ChatroomController.addUserToChatroom)
router.post('/chatrooms/:id/leave', authenticate, ChatroomController.leaveChatroom);
router.post('/chatrooms/:id/removeUser', authenticate, ChatroomController.deleteUserFromChatroom);

module.exports = router;
