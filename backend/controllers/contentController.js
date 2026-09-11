const fs = require('fs');
const { Readable } = require('stream');
const Content = require('../models/Content');
const AuditLog = require('../models/AuditLog');
const storageService = require('../services/storageService');

// ─── 1. List content (viewer & admin) ────────────────────────────────────────
exports.getContentList = async (req, res) => {
  try {
    const { category, contentType, search, sort } = req.query;
    const items = await Content.findAll({ category, contentType, search, sort });

    const formatted = items.map(item => {
      const doc = item._doc || item;
      return {
        id: doc._id || doc.id,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        contentType: doc.contentType,
        originalFilename: doc.originalFilename,
        mimeType: doc.mimeType,
        fileSize: doc.fileSize,
        viewCount: doc.viewCount || 0,
        uploadedBy: doc.uploadedBy,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    });

    return res.json({ success: true, data: formatted, total: formatted.length });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 2. Get single item metadata ──────────────────────────────────────────────
exports.getContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Content.findById(id);
    if (!item) return res.status(404).json({ success: false, error: 'Content item not found.' });

    const updated = await Content.incrementViews(id);
    const doc = updated._doc || updated;

    return res.json({
      success: true,
      data: {
        id: doc._id || doc.id,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        contentType: doc.contentType,
        originalFilename: doc.originalFilename,
        mimeType: doc.mimeType,
        fileSize: doc.fileSize,
        viewCount: doc.viewCount || 0,
        uploadedBy: doc.uploadedBy,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 3. Secure content delivery ───────────────────────────────────────────────
exports.streamContent = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Content.findById(id);
    if (!item) return res.status(404).json({ success: false, error: 'Content not found.' });

    const access = await storageService.getSecureAccess(
      item.storageKey,
      item.storageMode || 'local'
    );

    // If Supabase: redirect to short-lived signed URL (60s expiry)
    // This keeps the actual storage URL off the main page source but
    // still allows <video>, <iframe>, fetch() to load it temporarily.
    if (access.type === 'signedUrl') {
      // For video, we let the signed URL handle range requests directly
      // For PDF/HTML we proxy the content to avoid exposing the raw URL
      if (item.contentType === 'VIDEO') {
        return res.redirect(302, access.url);
      }

      // For PDF & HTML: proxy the content through the authenticated endpoint
      const upstream = await fetch(access.url);
      if (!upstream.ok) throw new Error('Failed to retrieve content from storage.');

      res.setHeader('Content-Type', item.mimeType);
      res.setHeader('Cache-Control', 'no-store, private');
      res.setHeader('Content-Disposition', 'inline');
      Readable.fromWeb(upstream.body).pipe(res);
      return;
    }

    // Local FS streaming
    const { filePath } = access;

    if (item.contentType === 'VIDEO') {
      return storageService.streamLocalFile(filePath, req, res, item.mimeType);
    }

    const stat = fs.statSync(filePath);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', item.mimeType);
    res.setHeader('Cache-Control', 'no-store, private');
    res.setHeader('Content-Disposition', 'inline');

    if (item.contentType === 'HTML') {
      res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' data: blob:; script-src 'unsafe-inline'");
    }

    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('[Stream Error]:', error.message);
    return res.status(500).json({ success: false, error: 'Content delivery failed.' });
  }
};

// ─── 4. Upload (Admin only) ───────────────────────────────────────────────────
exports.uploadContent = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file provided.' });

    const { title, description, category, contentType } = req.body;

    // Upload buffer to storage service (Supabase or local)
    const { storageKey, storageMode } = await storageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    const newContent = await Content.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category ? category.trim() : 'General',
      contentType,
      storageKey,
      storageMode,
      originalFilename: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: {
        userId: req.user.id,
        name: req.user.name,
        email: req.user.email,
      },
    });

    await AuditLog.record({
      action: 'UPLOAD',
      adminEmail: req.user.email,
      adminName: req.user.name,
      targetContentId: newContent._id || newContent.id,
      targetContentTitle: newContent.title,
      details: `Uploaded ${contentType}: "${req.file.originalname}" (${Math.round(req.file.size / 1024)} KB) via ${storageMode} storage`,
    });

    return res.status(201).json({
      success: true,
      message: 'Content uploaded and secured successfully.',
      data: {
        id: newContent._id || newContent.id,
        title: newContent.title,
        contentType: newContent.contentType,
        storageMode,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 5. Update metadata (Admin only) ──────────────────────────────────────────
exports.updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;

    const existing = await Content.findById(id);
    if (!existing) return res.status(404).json({ success: false, error: 'Content not found.' });

    const updated = await Content.updateById(id, {
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category ? category.trim() : 'General',
    });

    await AuditLog.record({
      action: 'EDIT',
      adminEmail: req.user.email,
      adminName: req.user.name,
      targetContentId: id,
      targetContentTitle: title,
      details: `Updated metadata for "${existing.title}" → title: "${title}", category: "${category}"`,
    });

    return res.json({ success: true, message: 'Content updated.', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 6. Delete (Admin only) ───────────────────────────────────────────────────
exports.deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Content.findById(id);
    if (!item) return res.status(404).json({ success: false, error: 'Content not found.' });

    // Delete from storage first
    try {
      await storageService.deleteFile(item.storageKey, item.storageMode || 'local');
    } catch (storageErr) {
      console.warn('[Delete] Storage deletion warning:', storageErr.message);
      // Continue to remove DB record even if storage delete partially fails
    }

    await Content.deleteById(id);

    await AuditLog.record({
      action: 'DELETE',
      adminEmail: req.user.email,
      adminName: req.user.name,
      targetContentId: id,
      targetContentTitle: item.title,
      details: `Permanently deleted "${item.title}" (${item.contentType}) from ${item.storageMode || 'local'} storage`,
    });

    return res.json({ success: true, message: `"${item.title}" deleted successfully.` });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 7. Admin stats + audit log ───────────────────────────────────────────────
exports.getAdminStats = async (req, res) => {
  try {
    const stats = await Content.getStats();
    const recentLogs = await AuditLog.getRecent(25);
    const storageMode = storageService.isUsingCloudinary() ? 'cloudinary' : storageService.isUsingSupabase() ? 'supabase' : 'local';

    return res.json({ success: true, stats, auditLogs: recentLogs, storageMode });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
