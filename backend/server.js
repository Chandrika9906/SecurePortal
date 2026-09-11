const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { initStorage } = require('./services/storageService');
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { seedSampleData } = require('./scripts/seed');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ──────────────────────────────────────────────────────────────────────
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      clientUrl,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error('CORS origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Secure Content Portal',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// ─── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 handler ───────────────────────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found.' });
});

// ─── Global error handler (no stack traces in production) ─────────────────────
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'An internal server error occurred.'
    : err.message || 'Server error.';
  console.error(`[API Error] ${status} — ${err.message}`);
  res.status(status).json({ success: false, error: message });
});

// ─── Boot ──────────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  initStorage();
  await seedSampleData();

  app.listen(PORT, '0.0.0.0', () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  SECURE CONTENT PORTAL API  v2.0  • Port ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Client URL : ${clientUrl}`);
    console.log('═══════════════════════════════════════════════════════');
  });
};

start();
