const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ['UPLOAD', 'EDIT', 'DELETE', 'LOGIN', 'ACCESS_DENIED'],
      required: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
    adminName: {
      type: String,
      default: 'Admin',
    },
    targetContentId: String,
    targetContentTitle: String,
    details: String,
    ipAddress: String,
  },
  {
    timestamps: true,
  }
);

const inMemoryLogs = [];

const AuditLog = {
  schema: auditLogSchema,
  model: mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema),

  async record(data) {
    try {
      if (mongoose.connection.readyState === 1) {
        return await this.model.create(data);
      }
    } catch (e) {}

    const newLog = {
      _id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      ...data,
      createdAt: new Date(),
    };
    inMemoryLogs.unshift(newLog);
    if (inMemoryLogs.length > 200) inMemoryLogs.pop(); // keep last 200
    return newLog;
  },

  async getRecent(limit = 20) {
    try {
      if (mongoose.connection.readyState === 1) {
        return await this.model.find().sort({ createdAt: -1 }).limit(limit);
      }
    } catch (e) {}
    return inMemoryLogs.slice(0, limit);
  }
};

module.exports = AuditLog;
