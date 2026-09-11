const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const { validateUpload, validateUpdate, validateFile } = require('../middleware/validation');

// Viewer accessible routes
router.get('/', protect, contentController.getContentList);
router.get('/:id', protect, contentController.getContentById);
router.get('/:id/stream', protect, contentController.streamContent);

// Admin-only mutation routes (RBAC enforced server-side)
router.post(
  '/upload',
  protect,
  adminOnly,
  upload.single('file'),
  handleMulterError,
  validateUpload,
  validateFile,
  contentController.uploadContent
);
router.put('/:id', protect, adminOnly, validateUpdate, contentController.updateContent);
router.delete('/:id', protect, adminOnly, contentController.deleteContent);

module.exports = router;
