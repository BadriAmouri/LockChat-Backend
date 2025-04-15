const express = require("express");
const { sendMessage, getMessages } = require("../controllers/MessageController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", sendMessage); 
router.get("/:chatroom_id", getMessages);



module.exports = router;

