const { Server } = require('socket.io');
const axios = require('axios');

let io;
let users = {};

const SOCKET_API_URL = 'https://lock-chat-backend.vercel.app/api/websocket/get-socket-id';

async function getCustomSocketId(userId) {
  try {
    const response = await axios.post(SOCKET_API_URL, { user_id: userId });
    return response.data.socket_id;
  } catch (error) {
    console.error('Error fetching socket_id:', error);
    return null;
  }
}

function initializeSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', async (socket) => {
    console.log(`✅ New user connected: ${socket.id}`);

    const userId = socket.handshake.query.userId;
    const customSocketId = await getCustomSocketId(userId);

    if (customSocketId) {
      socket.customId = customSocketId;
      console.log(`✅ User ${userId} assigned custom socket ID: ${customSocketId}`);
    } else {
      socket.customId = socket.id;
      console.log(`⚠️ No custom ID found for user ${userId}, using default socket ID: ${socket.id}`);
    }

    // Map userId -> socket object itself (NOT socket ID)
    users[userId] = socket;

    console.log('📜 Users after connection:', Object.keys(users));

    socket.emit('connected_message', { message: "You are connected!" });

    socket.on('update_status', ({ userId }) => {
      users[userId] = socket;
      console.log(`🔄 User ${userId} updated status`);
      console.log('📜 Users after status update:', Object.keys(users));
    });

    socket.on('typing', ({ senderId, recipientId }) => {
      const recipientSocket = users[recipientId];
      if (recipientSocket) {
        console.log(`✏️ ${senderId} is typing to ${recipientId}`);
        recipientSocket.emit('typing', { senderId });
      } else {
        console.log(`🚫 Typing event failed: ${recipientId} is offline`);
      }
    });

    socket.on('send_message', (data) => {
      console.log(`📩 Message from ${data.senderId} to ${data.recipientId}: ${data.message}`);

      const recipientSocket = users[data.recipientId];
      if (recipientSocket) {
        console.log(`✅ Sending message to ${data.recipientId}`);
        recipientSocket.emit('receive_message', {
          senderId: data.senderId,
          message: data.message,
        });
      } else {
        console.log(`🚫 Cannot send message: ${data.recipientId} is offline`);
      }

      console.log('📜 Users after message handling:', Object.keys(users));
    });

    socket.on('disconnect', () => {
      const disconnectedUserId = Object.keys(users).find(
        (id) => users[id] === socket
      );
      if (disconnectedUserId) {
        delete users[disconnectedUserId];
        console.log(`❌ User disconnected: ${disconnectedUserId}`);
      }
      console.log('📜 Users after disconnection:', Object.keys(users));
    });
  });
}


function checkUserConnection(userId) {
  return users.hasOwnProperty(userId); // Check if the userId exists in the users object
}

module.exports = { initializeSocketServer ,checkUserConnection };
