const db = require('../config/db'); // Assume we have a DB connection setup
const MessageKey = require('../models/MessageKey');
const crypto = require('crypto');
class KeyManagementService {
        /**
     * CEach sender-recipient pair should rotate keys every 100 messages exchanged between them.
     * @param {string} recipientId - The recipient's ID.
     * @param {string} senderId - The senderId's ID.
     * @returns {Promise<boolean>} True if a new key is needed.
     */
static async shouldRotateKey(userId1, userId2) {
    const { count, error } = await db
        .from('messages')
        .select('*', { count: 'exact' })
        .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`);

    if (error) throw new Error('Error checking message count: ' + error.message);

    return count % 100 === 0;
}

        
        
    
    /**
     * Stores a new encrypted AES key for both sender and recipient.
     * @param {string} senderId - The sender's ID.
     * @param {string} recipientId - The recipient's ID.
     * @param {string} encryptedKeyForSender - The AES key encrypted with sender's public key.
     * @param {string} encryptedKeyForRecipient - The AES key encrypted with recipient's public key.
     * @returns {Promise<void>}
     */
    static async storeEncryptedKey(senderId, recipientId, encryptedKeyForSender, encryptedKeyForRecipient) {
        await db.from('message_keys').insert([
            {
                sender_id: senderId,
                recipient_id: recipientId,
                encrypted_key_for_sender: encryptedKeyForSender,
                encrypted_key_for_recipient: encryptedKeyForRecipient,
                created_at: new Date().toISOString()
            }
        ]);
    }
    
    /**
     * Retrieves the user’s public key from the database.
     * @param {string} userId - User ID of the user.
     * @returns {string} The user’s public key in PEM format.
     */
   

    static async getPublicKey(userId) {
        const { data, error } = await db
            .from('users')
            .select('public_key')
            .eq('user_id', userId)
            .single();
    
        if (error) {
            console.error('Error fetching public key:', error.message);
            return null;
        }
    
        console.log("Fetched public key:", data);  // Debugging line
    
        return data?.public_key || null;
    }
    
    
}

module.exports = KeyManagementService; 

