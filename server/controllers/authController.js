const dbService = require('../services/dbService');

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await dbService.authenticateUser(email, password);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          profilePic: user.profilePic || '',
          schoolName: user.schoolName || '',
          address: user.address || '',
          age: user.age || '',
          language: user.language || 'English'
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  register: async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      const result = await dbService.registerUser({ email, password, name, role: role || 'client' });
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.status(201).json({ message: 'Registration successful', userId: result.id });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await dbService.getUserProfile(id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      // Remove password before sending
      delete user.password;
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body; // { name, profilePic, schoolName, address, age, language, password }
      
      await dbService.updateUserProfile(id, updateData);
      res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
};

module.exports = authController;
