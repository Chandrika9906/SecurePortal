const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['ADMIN', 'VIEWER'],
      default: 'VIEWER',
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Fallback in-memory storage array if MongoDB service is offline
const inMemoryUsers = [];

const User = {
  schema: userSchema,
  model: mongoose.models.User || mongoose.model('User', userSchema),
  
  // High-level helper methods that operate seamlessly across Mongoose or In-Memory
  async findByEmail(email) {
    try {
      if (mongoose.connection.readyState === 1) {
        return await this.model.findOne({ email: email.toLowerCase() });
      }
    } catch (e) {
      // Fallback
    }
    return inMemoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findById(id) {
    try {
      if (mongoose.connection.readyState === 1) {
        return await this.model.findById(id);
      }
    } catch (e) {
      // Fallback
    }
    return inMemoryUsers.find(u => u._id === id || u.id === id) || null;
  },

  async createOrUpdate(userData) {
    const email = userData.email.toLowerCase();
    try {
      if (mongoose.connection.readyState === 1) {
        let user = await this.model.findOne({ email });
        if (!user) {
          user = await this.model.create({ ...userData, email });
        } else {
          user.name = userData.name || user.name;
          user.picture = userData.picture || user.picture;
          user.role = userData.role || user.role;
          user.googleId = userData.googleId || user.googleId;
          user.lastLoginAt = new Date();
          await user.save();
        }
        return user;
      }
    } catch (e) {
      console.warn('[User Model] MongoDB error, falling back to memory store:', e.message);
    }

    // In-memory fallback
    let existingIndex = inMemoryUsers.findIndex(u => u.email.toLowerCase() === email);
    if (existingIndex >= 0) {
      inMemoryUsers[existingIndex] = {
        ...inMemoryUsers[existingIndex],
        ...userData,
        email,
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      };
      return inMemoryUsers[existingIndex];
    } else {
      const newUser = {
        _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        id: 'user_' + Date.now(),
        ...userData,
        email,
        role: userData.role || 'VIEWER',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      };
      inMemoryUsers.push(newUser);
      return newUser;
    }
  },

  async getAll() {
    try {
      if (mongoose.connection.readyState === 1) {
        return await this.model.find().sort({ createdAt: -1 });
      }
    } catch (e) {}
    return inMemoryUsers;
  }
};

module.exports = User;
