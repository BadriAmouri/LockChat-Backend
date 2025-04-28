// models/websocketModel.js
const db = require('../config/db'); // Your Supabase client

async function getUserSocketId(userId) {
    const { data, error } = await db
        .from('users')
        .select('socket_id')
        .eq('user_id', userId)
        .single();

    if (error) {
        throw error;
    }
    return data;
}

async function updateUserSocketId(userId, socketId) {
    const { data, error } = await db
        .from('users')
        .update({ socket_id: socketId })
        .eq('user_id', userId)
        .select('socket_id')  // Optional: return the updated socket_id
        .single();

    if (error) {
        throw error;
    }
    return data;
}

module.exports = { getUserSocketId, updateUserSocketId };
