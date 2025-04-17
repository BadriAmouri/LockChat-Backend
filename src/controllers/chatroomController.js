const Chatroom = require('../models/Chatroom');

class ChatroomController {
    static async createChatroom(req, res) {
        try {
            const { name, creatorId, isPrivate } = req.body;
            const userId = req.user.user_id

            // Ensure the request body is not empty
            if (!name || !creatorId || isPrivate === undefined) {
                return res.status(400).json({ message: "Fields 'name', 'creatorId', and 'isPrivate' are required." });
            }

            const chatroom = await Chatroom.createChatroom(name, creatorId, isPrivate);

            if (creatorId == userId) {
                await Chatroom.addUserToChatroom(chatroom, userId, 'admin')
            }
            else {
                await Chatroom.addUserToChatroom(chatroom, creatorId, 'admin')
                await Chatroom.addUserToChatroom(chatroom, userId, 'member')
            }
            res.status(201).json({ message: "Chatroom has been created successfully", chatroom });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getChatroomUsers(req, res) {
        try {
            const { id: chatroomId } = req.params; 

            const chatroomUsers = await Chatroom.getUsersInChatroom(chatroomId);
    
            if (!chatroomUsers || chatroomUsers.length === 0) {
                return res.status(404).json({ error: "No users found in this chatroom" });
            }
    
            return res.status(200).json(chatroomUsers);
    
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error });
        }
    }
    


    static async leaveChatroom(req, res) {
        try {
            const { id: chatroomId } = req.params; // chatroomId from URL
            const userId = req.user.user_id; // Extract user ID from JWT token

            // Step 1: Fetch chatroom members with roles from the model
            const chatroomMembers = await Chatroom.getUsersInChatroom(chatroomId);

            if (!chatroomMembers || chatroomMembers.length === 0) {
                return res.status(404).json({ error: "Chatroom not found" });
            }

            const userInChatroom = chatroomMembers.find(member => member.user_id == userId);
            if (!userInChatroom) {
                return res.status(404).json({ error: "User is not part of this chatroom" });
            }

            // Step 2: Handle admin role transfer if the user leaving is an admin
            if (userInChatroom.role === 'admin') {

                const newAdmin = chatroomMembers.find(member => member.role !== 'admin' && member.user_id !== userId);

                if (newAdmin) {
                    await Chatroom.transferAdminRole(chatroomId, newAdmin.user_id);
                } else {
                    if (chatroomMembers.length === 2)
                        await Chatroom.deleteChatroom(chatroomId);
                    return res.status(200).json({ message: "Chatroom closed as it had only one admin" });
                }
            }

            // Step 3: Remove the user from the chatroom using the new model function
            const leaveResult = await Chatroom.deleteUserFromChatroom(chatroomId, userId);

            // Step 4: Check if the chatroom will have less than two members after this
            if (chatroomMembers.length === 2) {
                await Chatroom.deleteChatroom(chatroomId);
                return res.status(200).json({ message: "Chatroom closed as it had only one admin" });

            }

            return res.status(200).json({ message: "User left the chatroom successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }


    static async deleteUserFromChatroom(req, res) {
        try {
            const { id: chatroomId } = req.params;
            const { userId } = req.body;
            const requesterId = req.user.id;
            const chatroomAdmin = await Chatroom.getAdminOfChatroom(chatroomId);

            if (!chatroomId || !userId) {
                return res.status(400).json({ error: "chatroomId and userId are required" });
            }

            if (!chatroomAdmin || chatroomAdmin.length === 0) {
                return res.status(403).json({ error: "No admin found for this chatroom" });
            }

            if (requesterId != chatroomAdmin[0].user_id) {
                return res.status(403).json({ error: "Only an admin can remove users from the chatroom" });
            }

            const chatroomMembers = await Chatroom.getUsersInChatroom(chatroomId);

            if (!chatroomMembers || chatroomMembers.length === 0) {
                return res.status(404).json({ error: "Chatroom not found" });
            }

            const result = await Chatroom.deleteUserFromChatroom(chatroomId, userId);

            if (!result) {
                return res.status(404).json({ error: "User or chatroom not found" });
            }

            if (chatroomMembers.length === 2) {
                await Chatroom.deleteChatroom(chatroomId);
                return res.status(200).json({ message: "User removed and chatroom closed as only admin remained" });
            }

            return res.status(200).json({ message: "User removed from chatroom successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async addUserToChatroom(req, res) {
        try {
            const { userId } = req.body;
            const { id: chatroomId } = req.params

            // Ensure the request body is not empty
            if (!chatroomId || !userId) {
                return res.status(400).json({ message: "Field 'userId' is required." });
            }

            const chatroom = await Chatroom.getChatroomById(chatroomId);
            const chatroomAdmin = await Chatroom.getAdminOfChatroom(chatroomId);


            if (req.user.user_id != chatroomAdmin[0].user_id) {
                return res.status(401).json({ message: "Access Denied" });
            }

            await Chatroom.addUserToChatroom(chatroomId, userId);
            res.status(200).json({ message: "User has been added successfully" });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    static async updateChatroom(req, res) {
        try {
            const { id: chatroomId } = req.params;
            const { name, isPrivate } = req.body;
            const userId = req.user.user_id;

            // Ensure the request body is not empty
            if (!name || isPrivate === undefined) {
                return res.status(400).json({ message: "Both 'name' and 'isPrivate' fields are required." });
            }

            const chatroom = await Chatroom.getChatroomById(chatroomId);
            const chatroomAdmin = await Chatroom.getAdminOfChatroom(chatroomId);


            if (!chatroom) {
                return res.status(404).json({ message: "Chatroom not found." });
            }

            if (userId != chatroomAdmin[0].user_id) {
                return res.status(401).json({ message: "Access Denied" });
            }

            await Chatroom.updateChatroom(chatroomId, name, isPrivate);
            res.status(200).json({ message: "Chatroom updated successfully" });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }



    static async getUserChatrooms(req, res) {
        try {
            const userId = req.user.user_id;
            const chatrooms = await Chatroom.getUserChatrooms(userId);
            console.log("getUserChatrooms controller called successfully!");
            res.status(200).json(chatrooms);
        } catch (error) {
            res.status(500).json({ error: error.message ,message: "problem from getUserChatrooms controller" });
        }
    }



    static async getMessagesInChatroom(req, res) {
        try {
            const { id: chatroomId } = req.params;
            const messages = await Chatroom.getMessagesInChatroom(chatroomId);
            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ChatroomController;
