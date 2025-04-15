const db = require('../config/db');

class Chatroom {

    static async createChatroom(name, creatorId, isPrivate) {
        const { data, error } = await db
            .from('chatrooms')
            .insert([
                {

                    name: name,
                    created_by: creatorId,
                    is_private: isPrivate,
                    created_at: new Date()
                }
            ])
            .select('chatroom_id')
            .single();

        if (error) throw new Error('Error creating chatroom: ' + error.message);
        return data.chatroom_id;
    }

    static async getChatroomById(chatroomId) {
        const { data, error } = await db
            .from('chatrooms')
            .select('chatroom_id, name, created_by, is_private, created_at')
            .eq('chatroom_id', chatroomId)
            .single();

        if (error) throw new Error('Error fetching chatroom: ' + error.message);
        return data;
    }

    static async updateChatroom(chatroomId, name, isPrivate) {
        const { data, error } = await db
            .from('chatrooms')
            .update({ name: name, is_private: isPrivate }) // Update the name and isPrivate attributes
            .eq('chatroom_id', chatroomId); // Specify the chatroom to update

        if (error) {
            throw new Error('Error updating chatroom: ' + error.message);
        }

        return data; // Return the updated chatroom data
    }

    static async transferAdminRole(chatroomId, newAdminUserId) {
        const { error } = await db
            .from('chatroom_members')
            .update({ role: 'admin' })
            .eq('chatroom_id', chatroomId)
            .eq('user_id', newAdminUserId);

        if (error) throw new Error('Error transferring admin role: ' + error.message);
    }

    static async deleteChatroom(chatroomId) {

        const { error: deleteError } = await db
            .from('chatrooms')
            .delete()
            .eq('chatroom_id', chatroomId);

        if (deleteError) throw new Error('Error deleting chatroom: ' + deleteError.message);
    }


    static async getMessagesInChatroom(chatroomId) {
        const { data, error } = await db
            .from('messages')
            .select('message_id, sender_id, encrypted_message, encryption_key_id, message_type, sent_at, status, iv')
            .eq('chatroom_id', chatroomId)
            .order('sent_at', { ascending: true });

        if (error) throw new Error('Error fetching messages in chatroom: ' + error.message);
        return data;
    }

    /**
     * Adds a user to a chatroom.
     * @param {number} chatroomId - The chatroom ID.
     * @param {string} userId - The user ID.
     * @returns {Promise<void>} Resolves when user is added.
     */
    static async addUserToChatroom(chatroomId, userId, role) {
        const { error } = await db
            .from('chatroom_members')
            .insert([{ chatroom_id: chatroomId, role: role, user_id: userId, joined_at: new Date() }]);

        if (error) throw new Error('Error adding user to chatroom: ' + error.message);
    }

    static async getAdminOfChatroom(chatroomId) {
        const { data, error } = await db
            .from('chatroom_members')
            .select('user_id')
            .eq('chatroom_id', chatroomId)
            .eq('role', 'admin');

        if (error) throw new Error('Error fetching user in chatroom: ' + error.message);
        return data;
    }


    static async getUsersInChatroom(chatroomId) {
        const { data, error } = await db
            .from('chatroom_members')
            .select('user_id, role, users(full_name)')  
            .eq('chatroom_id', chatroomId);
        
        if (error) throw new Error('Error fetching users in chatroom: ' + error.message);
        return data;
    }
    

    static async deleteUserFromChatroom(chatroomId, userId) {
        const { data, error } = await db
            .from('chatroom_members')
            .delete()
            .eq('chatroom_id', chatroomId)
            .eq('user_id', userId)

        if (error) throw new Error('Error deleting user from chatroom: ' + error.message);
        return data;
    }

    /**
     * Retrieves all chatrooms that a user is a member of, including the last message and members.
     * @param {string} userId - The user ID.
     * @returns {Promise<Array>} List of chatrooms with last message and members.
     */
    static async getUserChatrooms(userId) {
        const { data, error } = await db
            .rpc('get_user_chatrooms_with_last_message', { user_id_param: parseInt(userId) }); // Ensure userId is an integer

        if (error) throw new Error('Error fetching user chatrooms: ' + error.message);
        return data;
    }
}

module.exports = Chatroom;
