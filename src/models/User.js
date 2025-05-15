const supabase = require('../config/db');

class UserModel {

    static async createUser(fullname,username,email,hashedPassword,publicKey, profileImageUrl = null){
        const {data , error } = await supabase
        .from('users')
        .insert({
            full_name: fullname,
            username: username,
            email: email,
            password_hash: hashedPassword,
            public_key: publicKey,
            profile_pic: profileImageUrl
        }).select('*')
        .single();

        if (error) {
            console.error('Error creating user:', error);
            return null;
        }
        return data;
    }

    static async getUserById(userId) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();
    
        if (error) {
            console.error('Error fetching user by ID:', error);
            return null;
        }
        return data;
    }
    
    static async getUserByUsername(username) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();
        if (error) {
            console.error('Error fetching user:', error);
            return null;
        }
        else{
            console.log('User fetched:', data);
            // Check if the user exists
            if (!data) {
                console.log('User not found');
                return null;
            }
            return data;
        }
        
    }


    static async searchUsersByUsername(query, excludeUserId) {
        const { data, error } = await supabase
        .from('users')
        .select('user_id, username,full_name')
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .neq('user_id', excludeUserId); // exclude the current user

        if (error) throw new Error(error.message);
        return data;
    }


    static async storeRefreshToken(userId, refreshToken) {
        const { error } = await supabase
            .from('users')
            .update({ refresh_token: refreshToken })
            .eq('user_id', userId);

        if (error) {
            console.error('Error storing refresh token:', error);
            return false;
        }
        return true;
    }
    static async getRefreshToken(userId) {
        const { data, error } = await supabase
            .from('users')
            .select('refresh_token')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error fetching refresh token:', error);
            return null;
        }
        return data.refresh_token;
     }

     static async invalidateToken(userId) {
        const { error } = await supabase
            .from('users')
            .update({ refresh_token: null })
            .eq('user_id', userId);

        if (error) {
            console.error('Error invalidating token:', error);
            return false;
        }
        return true;
     }
     static async updatePassword(username, newHashedPassword) {
        const { error } = await supabase
            .from('users')
            .update({ password_hash: newHashedPassword })
            .eq('username', username);
    
        console.log('Updating password for:', username);
        console.log('Supabase response:', error);
    
        if (error) {
            console.error('Error updating password:', error);
            return false;
        }
    
        return true;
    }  
    static async updateUsername(username, newUsername) {
        const { error } = await supabase
            .from('users')
            .update({ username: newUsername })
            .eq('username', username);
        if (error){
            console.error('Error updating username from user model:', error);
            return false;   
        }
        return true;
    }

    static async updateEmail(username, newEmail) {
        const { error } = await supabase
            .from('users')
            .update({ email: newEmail })
            .eq('username', username);
        if (error){
            console.error('Error updating email from user model:', error);
            return false;
        }
        return true;
    }
}

module.exports = UserModel;