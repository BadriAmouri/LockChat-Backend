const Invitation = require("../models/Invitation");

class InvitationController {
  static async sendInvitation(req, res) {
    const inviterId = req.user.user_id;
    const { invitedUserId } = req.body;
  
    try {
      if (inviterId === invitedUserId) {
        return res.status(400).json({ message: "You cannot invite yourself." });
      }
  
      // Check if they are already friends (chatroom exists)
      const alreadyFriends = await Invitation.chatroomExistsBetweenUsers(inviterId, invitedUserId);
      if (alreadyFriends) {
        return res.status(400).json({ message: "You are already friends." });
      }
  
      // Check if an invitation already exists in either direction
      const alreadyInvited = await Invitation.existingInvitationBetweenUsers(inviterId, invitedUserId);
      if (alreadyInvited) {
        return res.status(400).json({ message: "An invitation already exists or has been accepted." });
      }
  
      const invitation = await Invitation.createInvitation(inviterId, invitedUserId);
      res.status(201).json(invitation);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: error.message });
    }
  }
  

  static async getMyPendingInvitations(req, res) {
    const userId = req.user.user_id;

    try {
      const invitations = await Invitation.getPendingInvitationsForUser(userId);
      res.json(invitations);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: error.message });
    }
  }

  static async respondToInvitation(req, res) {
    const userId = req.user.user_id;
    const { invitationId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'

    try {
      const invitation = await Invitation.getInvitationById(invitationId);

      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found." });
      }

      if (invitation.invited_user_id !== userId) {
        return res.status(403).json({ message: "You are not authorized to respond to this invitation." });
      }

      if (invitation.status !== 'pending') {
        return res.status(400).json({ message: "Invitation has already been responded to." });
      }

      let updatedInvitation;
      if (action === 'accept') {
        updatedInvitation = await Invitation.updateInvitationStatus(invitationId, 'accepted');
        // ⚡ Here you could trigger the chatroom creation if needed
      } else if (action === 'decline') {
        updatedInvitation = await Invitation.updateInvitationStatus(invitationId, 'declined');
      } else {
        return res.status(400).json({ message: "Invalid action. Must be 'accept' or 'decline'." });
      }

      res.status(200).json({ 
        message: `Invitation ${action}ed successfully.`,
        invitation: updatedInvitation
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = InvitationController;
