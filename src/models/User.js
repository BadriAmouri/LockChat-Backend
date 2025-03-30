const supabase = require('../config/db');

class User {
    static async createUser(username,email,hashedPassword,publicKey){
        const {data , error } = await supabase
        .from('users')
        .insert({
            username: username,
            email: email,
            password_hash: hashedPassword,
            public_key: publicKey
        }).select('*')
        .single();

        if (error) {
            console.error('Error creating user:', error);
            return null;
        }
        return data;
    }

    static async getUserByUsername(username,res) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();
        if (error) {
            console.error('Error fetching user:', error);
            return null;
        }
        return data;
    }
}

module.exports = User;