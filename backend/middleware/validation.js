/**
 * Validation middleware using express-validator.
 * All validation is server-side authoritative.
 */
const { body, param, validationResult } = require('express-validator');
const path = require('path');

// Extract and format validation errors into structured API response
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: 'Validation failed.',
      fields: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Validate upload form fields
const validateUpload = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters.'),
  body('contentType')
    .notEmpty().withMessage('Content type is required.')
    .isIn(['VIDEO', 'PDF', 'HTML']).withMessage('Content type must be VIDEO, PDF, or HTML.'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Category must be under 100 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must be under 2000 characters.'),
  handleValidationErrors,
];

// Validate metadata update
const validateUpdate = [
  param('id').notEmpty().withMessage('Content ID is required.'),
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters.'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Category must be under 100 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must be under 2000 characters.'),
  handleValidationErrors,
];

// Server-side file validation (MIME + extension + filename safety)
const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file was provided.' });
  }

  const contentType = req.body.contentType;
  const file = req.file;
  const ext = path.extname(file.originalname || '').toLowerCase();
  const filename = file.originalname || '';

  // Reject dangerous filename patterns (path traversal etc.)
  if (/[\/\\<>:"|?*\x00-\x1f]/.test(filename) || filename.startsWith('.')) {
    return res.status(400).json({ success: false, error: 'Filename contains invalid characters.' });
  }

  const mimeTypeMap = {
    VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
    PDF: ['application/pdf'],
    HTML: ['text/html'],
  };

  const extMap = {
    VIDEO: ['.mp4', '.webm', '.ogv'],
    PDF: ['.pdf'],
    HTML: ['.html', '.htm'],
  };

  if (!contentType || !mimeTypeMap[contentType]) {
    return res.status(400).json({ success: false, error: 'Invalid content type specified.' });
  }

  const isMimeValid = mimeTypeMap[contentType].includes(file.mimetype);
  const isExtValid = extMap[contentType].includes(ext);

  if (!isMimeValid || !isExtValid) {
    return res.status(400).json({
      success: false,
      error: `Invalid file. For ${contentType}, expected: ${extMap[contentType].join(', ')} (received: ${file.mimetype} / ${ext})`,
    });
  }

  next();
};

module.exports = { validateUpload, validateUpdate, validateFile, handleValidationErrors };
