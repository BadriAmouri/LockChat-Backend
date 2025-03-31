const db = require('../config/db');

class Message {
    /**
     * Stores an encrypted message in the database.
     * @param {string} senderId - The ID of the sender.
     * @param {string|null} recipientId - The recipient ID (for DMs).
     * @param {string|null} chatroomId - The chatroom ID (for group chats).
     * @param {string} encryptedMessage - The AES-256 encrypted message.
     * @param {string} encryptionKeyId - UUID of the encryption key used.
     * @param {string} messageType - Type of message ('text', 'image', etc.).
     * @returns {Promise<number>} The stored message ID.
     */
    static async storeMessage(senderId, recipientId, chatroomId, encryptedMessage, encryptionKeyId, iv, messageType) {
        const { data, error } = await db
            .from('messages')
            .insert([{
                sender_id: senderId,
                recipient_id: recipientId || null, // DM or NULL
                chatroom_id: chatroomId || null,  // Group chat or NULL
                encrypted_message: encryptedMessage,
                encryption_key_id: encryptionKeyId,
                iv: iv,
                message_type: messageType,
                is_deleted: false,
                sent_at: new Date(), // Auto-set timestamp
                status: 'sent', // Default status
                updated_status_at: new Date()
            }])
            .select('message_id')
            .single();

        if (error) throw new Error('Error storing message: ' + error.message);
        return data.message_id;
    }


    /**
     * Retrieves an encrypted message for a given message ID.
     * @param {number} messageId - The message ID.
     * @returns {Promise<Object>} Message details including encrypted content.
     */
    static async getMessageById(messageId) {
        const { data, error } = await db
            .from('messages')
            .select('encrypted_message, encryption_key_id')
            .eq('message_id', messageId)
            .single();

        if (error) throw new Error('Error fetching message: ' + error.message);
        return data;
    }

     /**
     * Retrieves all messages sent by a specific sender.
     * @param {string} senderId - The sender's ID.
     * @returns {Promise<Array>} List of messages.
     */
     static async getMessagesBySender(senderId) {
        const { data, error } = await db
            .from('messages')
            .select('message_id, recipient_id, chatroom_id, encrypted_message, encryption_key_id, message_type, sent_at, status,iv')
            .eq('sender_id', senderId)
            .order('sent_at', { ascending: false });

        if (error) throw new Error('Error fetching messages by sender: ' + error.message);
        return data;
    }
        /**
     * Retrieves all messages received by a specific recipient.
     * @param {string} recipientId - The recipient's ID.
     * @returns {Promise<Array>} List of messages.
     */
        static async getMessagesByRecipient(recipientId) {
            const { data, error } = await db
                .from('messages')
                .select('message_id, sender_id, chatroom_id, encrypted_message, encryption_key_id, message_type, sent_at, status,iv')
                .eq('recipient_id', recipientId)
                .order('sent_at', { ascending: false });
    
            if (error) throw new Error('Error fetching messages by recipient: ' + error.message);
            return data;
        }



            /**
         * Retrieves all messages exchanged between two users.
         * @param {string} user1Id - The first user ID.
         * @param {string} user2Id - The second user ID.
         * @returns {Promise<Array>} List of messages exchanged.
         */
            static async getMessagesBetweenUsers(user1Id, user2Id) {
                const { data, error } = await db
                    .from('messages')
                    .select('message_id, sender_id, recipient_id, encrypted_message, encryption_key_id, message_type, sent_at, status')
                    .or(`sender_id.eq.${user1Id},recipient_id.eq.${user2Id}`)
                    .or(`sender_id.eq.${user2Id},recipient_id.eq.${user1Id}`)
                    .order('sent_at', { ascending: true });
            
                if (error) throw new Error('Error fetching messages between users: ' + error.message);
                return data;
            }

}

module.exports = Message;
