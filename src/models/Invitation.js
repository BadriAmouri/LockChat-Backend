const db = require('../config/db');

class Invitation {
  static async createInvitation(inviterId, invitedUserId) {
    const { data, error } = await db
      .from('invitations')
      .insert([{ inviter_id: inviterId, invited_user_id: invitedUserId, status: 'pending' }])
      .select()
      .single();

    if (error) throw new Error('Error creating invitation: ' + error.message);
    return data;
  }

  static async getPendingInvitationsForUser(userId) {
    const { data, error } = await db
      .from('invitations')
      .select('invitation_id, inviter_id, invited_user_id, status, created_at, users!inviter_id(full_name)')
      .eq('invited_user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Error fetching invitations: ' + error.message);
    return data;
  }

  static async updateInvitationStatus(invitationId, newStatus) {
    const { data, error } = await db
      .from('invitations')
      .update({ status: newStatus })
      .eq('invitation_id', invitationId)
      .select()
      .single();

    if (error) throw new Error('Error updating invitation: ' + error.message);
    return data;
  }

  static async getInvitationById(invitationId) {
    const { data, error } = await db
      .from('invitations')
      .select('*')
      .eq('invitation_id', invitationId)
      .single();

    if (error) throw new Error('Error fetching invitation: ' + error.message);
    return data;
  }
}

module.exports = Invitation;
