const supabase = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const sendMessage = async (req, res) => {
    const { recipient_id, chatroom_id, encrypted_message, encrypted_keys, message_type } = req.body;
    const sender_id = 1 //req.user.userId; // Extract user from JWT token

    try {
        // Step 1: Store the message
        const { data: message, error: messageError } = await supabase
            .from("messages")
            .insert([
                {
                    message_id: uuidv4(),
                    sender_id,
                    recipient_id,
                    chatroom_id,
                    encrypted_message,
                    message_type,
                    status: "sent",
                    sent_at: new Date(),
                }
            ])
            .select()
            .single();

        if (messageError) throw messageError;

        // Step 2: Store encrypted symmetric keys
        const keysData = encrypted_keys.map((key) => ({
            encrypted_key_id: uuidv4(),
            recipient_id: key.recipient_id,
            encrypted_key: key.encrypted_key,
        }));

        const { error: keyError } = await supabase.from("message_keys").insert(keysData);
        if (keyError) throw keyError;

        res.status(201).json({ message: "Message sent successfully", message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMessages = async (req, res) => {
    const { chatroom_id } = req.params;
    const user_id = req.user.userId; // Extract user from JWT token

    try {
        // Step 1: Fetch encrypted messages for the chatroom
        const { data: messages, error: messageError } = await supabase
            .from("Messages")
            .select("message_id, sender_id, encrypted_message, message_type, sent_at")
            .eq("chatroom_id", chatroom_id)
            .order("sent_at", { ascending: true });

        if (messageError) throw messageError;

        // Step 2: Fetch encrypted keys for the requesting user
        const messageIds = messages.map(msg => msg.message_id);

        const { data: encryptedKeys, error: keyError } = await supabase
            .from("Message_Keys")
            .select("message_id, encrypted_key")
            .in("message_id", messageIds)
            .eq("recipient_id", user_id);

        if (keyError) throw keyError;

        // Step 3: Combine messages with their respective encrypted keys
        const messagesWithKeys = messages.map(msg => ({
            ...msg,
            encrypted_key: encryptedKeys.find(key => key.message_id === msg.message_id)?.encrypted_key || null,
        }));

        res.status(200).json(messagesWithKeys);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = { sendMessage ,getMessages };
