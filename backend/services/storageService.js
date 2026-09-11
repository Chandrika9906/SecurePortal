/**
 * Storage Service — Dual-mode: Supabase (production) + Local FS (development fallback)
 *
 * When SUPABASE_URL + SUPABASE_SERVICE_KEY are set → uses Supabase private bucket
 * Otherwise → falls back to local private_uploads directory
 *
 * Files in Supabase are stored in a PRIVATE bucket with no public access.
 * Signed URLs expire in 60 seconds and are generated per-request after auth check.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

let supabase = null;
let useSupabase = false;
let cloudinary = null;
let useCloudinary = false;

const initStorage = () => {
  // Cloudinary (priority 1 if configured)
  if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
    try {
      cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
      useCloudinary = true;
      console.log('[Storage] Cloudinary storage initialized.');
    } catch (e) {
      console.warn('[Storage] Cloudinary init failed:', e.message);
    }
  }

  // Supabase (priority 2)
  if (!useCloudinary && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY,
        { auth: { persistSession: false } }
      );
      useSupabase = true;
      console.log('[Storage] Supabase private storage initialized.');
    } catch (e) {
      console.warn('[Storage] Supabase init failed, falling back to local FS:', e.message);
    }
  } else if (!useCloudinary) {
    console.log('[Storage] No cloud storage config found. Using local private_uploads storage.');
  }

  // Ensure local fallback dir exists
  const localDir = path.resolve(process.env.STORAGE_PATH || './private_uploads');
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }
};

/**
 * Upload a file buffer to storage.
 * Returns: { storageKey, storageMode }
 */
const uploadFile = async (fileBuffer, originalFilename, mimeType) => {
  const ext = path.extname(originalFilename).toLowerCase();
  const safeKey = `${uuidv4()}${ext}`;

  // Cloudinary upload
  if (useCloudinary && cloudinary) {
    const resourceType = mimeType.startsWith('video/') ? 'video' : 'raw';
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: safeKey,
          resource_type: resourceType,
          folder: 'portal-content',
          access_mode: 'authenticated', // private — requires signed URL
        },
        (error, result) => error ? reject(error) : resolve(result)
      );
      const { Readable } = require('stream');
      Readable.from(fileBuffer).pipe(stream);
    });
    return { storageKey: result.public_id, storageMode: 'cloudinary' };
  }

  if (useSupabase && supabase) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'portal-content';
    const { error } = await supabase.storage
      .from(bucket)
      .upload(safeKey, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw new Error(`Supabase upload failed: ${error.message}`);
    return { storageKey: safeKey, storageMode: 'supabase' };
  }

  // Local FS fallback
  const localDir = path.resolve(process.env.STORAGE_PATH || './private_uploads');
  const filePath = path.join(localDir, safeKey);
  fs.writeFileSync(filePath, fileBuffer);
  return { storageKey: safeKey, storageMode: 'local' };
};

/**
 * Generate a short-lived signed URL (Supabase) or stream local file.
 * Returns: { type: 'signedUrl', url } | { type: 'localPath', filePath }
 */
const getSecureAccess = async (storageKey, storageMode) => {
  // Cloudinary signed URL (1 minute expiry)
  if (storageMode === 'cloudinary' || (useCloudinary && cloudinary)) {
    const signedUrl = cloudinary.utils.private_download_url(storageKey, '', {
      expires_at: Math.floor(Date.now() / 1000) + 60,
      attachment: false,
    });
    return { type: 'signedUrl', url: signedUrl };
  }

  if ((storageMode === 'supabase' || useSupabase) && supabase) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'portal-content';
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storageKey, 60); // 60-second expiry

    if (error) throw new Error(`Failed to generate signed URL: ${error.message}`);
    return { type: 'signedUrl', url: data.signedUrl };
  }

  // Local FS fallback path
  const localDir = path.resolve(process.env.STORAGE_PATH || './private_uploads');
  const filePath = path.join(localDir, storageKey);
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found in local storage.');
  }
  return { type: 'localPath', filePath };
};

/**
 * Delete a file from storage.
 */
const deleteFile = async (storageKey, storageMode) => {
  if (storageMode === 'cloudinary' || (useCloudinary && cloudinary)) {
    try {
      await cloudinary.uploader.destroy(storageKey, { resource_type: 'raw' });
      await cloudinary.uploader.destroy(storageKey, { resource_type: 'video' });
    } catch (e) { console.warn('[Delete] Cloudinary delete warning:', e.message); }
    return;
  }

  if ((storageMode === 'supabase' || useSupabase) && supabase) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'portal-content';
    const { error } = await supabase.storage.from(bucket).remove([storageKey]);
    if (error) throw new Error(`Supabase delete failed: ${error.message}`);
    return;
  }

  const localDir = path.resolve(process.env.STORAGE_PATH || './private_uploads');
  const filePath = path.join(localDir, storageKey);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

/**
 * Stream local file with HTTP Range support (for video).
 * Only applicable to local storage mode.
 */
const streamLocalFile = (filePath, req, res, mimeType) => {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send('Requested Range Not Satisfiable');
      return;
    }

    const chunksize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mimeType || 'video/mp4',
      'Cache-Control': 'no-cache, private',
    });
    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': mimeType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    fs.createReadStream(filePath).pipe(res);
  }
};

module.exports = { initStorage, uploadFile, getSecureAccess, deleteFile, streamLocalFile, isUsingSupabase: () => useSupabase, isUsingCloudinary: () => useCloudinary };
