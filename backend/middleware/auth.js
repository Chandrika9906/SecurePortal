const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const protect = async (req, res, next) => {
  let token;

  // 1. Check HttpOnly cookie first
  if (req.cookies && req.cookies.portal_token) {
    token = req.cookies.portal_token;
  }
  // 2. Fallback to Authorization Header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 3. Fallback for html stream iframe/video src query parameter token if needed
  else if (req.query && req.query.auth_token) {
    token = req.query.auth_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in with your Google account.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_32chars_long_key!';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User session invalid or user record no longer exists.',
      });
    }

    req.user = {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      picture: user.picture,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid token. Please log in again.',
    });
  }
};

const adminOnly = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required.',
    });
  }

  if (req.user.role !== 'ADMIN') {
    // Audit attempt to breach admin route
    await AuditLog.record({
      action: 'ACCESS_DENIED',
      adminEmail: req.user.email,
      adminName: req.user.name,
      details: `Viewer attempted unauthorized access to ADMIN endpoint ${req.originalUrl}`,
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    return res.status(403).json({
      success: false,
      error: 'Forbidden: You do not have ADMIN permissions to perform this operation.',
    });
  }

  next();
};

module.exports = { protect, adminOnly };
