// controllers/userController.js
const UserModel = require('../models/User');


class UserController{
static async searchForUsers (req, res) {
  const { query } = req.query;
  const currentUserId = req.user.id; // set by your auth middleware

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    const users = await UserModel.searchUsersByUsername(query, currentUserId);
    return res.json(users);
  } catch (error) {
    console.error('Search Error:', error);
    return res.status(500).json({ message: 'Failed to search users' });
  }
};
}
module.exports = UserController
