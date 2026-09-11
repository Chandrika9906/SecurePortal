const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use memory storage so we can pass the buffer to either Supabase or local FS
const storage = multer.memoryStorage();

const maxMb = parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10);

const upload = multer({
  storage,
  limits: {
    fileSize: maxMb * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf',
      'text/html',
    ];
    const allowedExts = ['.mp4', '.webm', '.ogv', '.pdf', '.html', '.htm'];
    const ext = path.extname(file.originalname || '').toLowerCase();

    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
      return cb(null, true);
    }
    cb(new Error(`Unsupported file type: ${file.mimetype} (${ext}). Allowed: MP4/WebM videos, PDF, HTML.`));
  },
});

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: `File too large. Maximum allowed size is ${maxMb} MB.`,
      });
    }
    return res.status(400).json({ success: false, error: err.message });
  }
  if (err && err.message) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next(err);
};

module.exports = { upload, handleMulterError };
