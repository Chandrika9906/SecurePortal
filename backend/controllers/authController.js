const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_32chars_long_key!';
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: '7d' }
  );
};

const setAuthCookie = (res, token) => {
  res.cookie('portal_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// 1. Google OAuth Token Verification Endpoint
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, error: 'Google credential missing.' });
    }

    let payload;
    // Verify credential with Google API if Client ID is configured
    if (process.env.GOOGLE_CLIENT_ID) {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      // Decode credential payload directly when running without live Client ID
      payload = jwt.decode(credential);
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, error: 'Invalid Google token payload.' });
    }

    const { email, name, picture, sub } = payload;

    // Check if email matches configured Admin allowlist
    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@enterprise.com')
      .split(',')
      .map(e => e.trim().toLowerCase());
    
    const initialRole = adminEmails.includes(email.toLowerCase()) ? 'ADMIN' : 'VIEWER';

    const user = await User.createOrUpdate({
      googleId: sub,
      email,
      name: name || email.split('@')[0],
      picture: picture || '',
      role: initialRole,
    });

    const token = generateToken(user);
    setAuthCookie(res, token);

    await AuditLog.record({
      action: 'LOGIN',
      adminEmail: user.email,
      adminName: user.name,
      details: `User signed in via Google OAuth with role ${user.role}`,
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Auth] Google OAuth verification error:', error);
    return res.status(400).json({
      success: false,
      error: 'Google authentication failed: ' + error.message,
    });
  }
};

// 2. Fast Demo Sign-In Endpoint (For local reviewer testing without GCP console setup)
exports.demoLogin = async (req, res) => {
  try {
    const { role } = req.body; // 'ADMIN' or 'VIEWER'
    const targetRole = role === 'ADMIN' ? 'ADMIN' : 'VIEWER';

    const email = targetRole === 'ADMIN' ? 'admin@enterprise.com' : 'viewer@enterprise.com';
    const name = targetRole === 'ADMIN' ? 'Sarah Jenkins (Admin)' : 'Alex Rivera (Viewer)';
    const picture = targetRole === 'ADMIN'
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const user = await User.createOrUpdate({
      email,
      name,
      picture,
      role: targetRole,
    });

    const token = generateToken(user);
    setAuthCookie(res, token);

    await AuditLog.record({
      action: 'LOGIN',
      adminEmail: user.email,
      adminName: user.name,
      details: `User signed in via Demo Sign-In as ${user.role}`,
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Get Current User Session
exports.getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
};

// 4. Logout Endpoint
exports.logout = async (req, res) => {
  res.clearCookie('portal_token');
  return res.json({ success: true, message: 'Logged out successfully.' });
};
