const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Content = require('../models/Content');
const AuditLog = require('../models/AuditLog');

const uploadDir = path.resolve(process.env.STORAGE_PATH || './private_uploads');

const runReseed = async () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  RESEEDING WITH 100% ORIGINAL COMPETITION-READY CONTENT');
  console.log('═══════════════════════════════════════════════════════');

  await connectDB();

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Admin user creator
  const adminUser = await User.createOrUpdate({
    email: 'admin@enterprise.com',
    name: 'Sarah Jenkins (Platform Admin)',
    picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'ADMIN',
  });

  // 1. Create HTML Asset 1: Internship & Technical Onboarding Guide
  const html1Content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Internship Evaluation & Technical Onboarding</title>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 2.5rem; line-height: 1.6; }
    .card { background: #1e293b; max-width: 850px; margin: 0 auto; padding: 2.5rem; border-radius: 16px; border: 1px solid #334155; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .badge { display: inline-block; background: #4f46e5; color: #fff; padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; tracking: 0.05em; margin-bottom: 1rem; }
    h1 { color: #818cf8; font-size: 1.8rem; margin-top: 0; border-b: 1px solid #334155; padding-bottom: 1rem; }
    h2 { color: #38bdf8; font-size: 1.3rem; margin-top: 1.8rem; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
    .item { background: #0f172a; padding: 1.2rem; border-radius: 10px; border: 1px solid #334155; }
    .item-title { font-weight: 700; color: #a5b4fc; margin-bottom: 0.4rem; }
    .alert { background: rgba(99, 102, 241, 0.15); border-left: 4px solid #6366f1; padding: 1rem 1.5rem; border-radius: 8px; margin-top: 2rem; color: #c7d2fe; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Official Onboarding Portal</span>
    <h1>Internship Technical Evaluation & Best Practices</h1>
    <p>Welcome to the official technical orientation handbook. This interactive guide outlines operational standards, codebase guidelines, and project evaluation metrics.</p>

    <h2>1. Key Evaluation Pillars</h2>
    <div class="grid">
      <div class="item">
        <div class="item-title">🔒 Security & Authentication</div>
        <p style="font-size:0.9rem; color:#94a3b8; margin:0;">Enforce JWT validation, HttpOnly cookie storage, and sanitize user input across all API endpoints.</p>
      </div>
      <div class="item">
        <div class="item-title">⚡ High-Performance Architecture</div>
        <p style="font-size:0.9rem; color:#94a3b8; margin:0;">Optimize MongoDB queries using indexed fields and deliver media assets via HTTP range streaming.</p>
      </div>
      <div class="item">
        <div class="item-title">🎨 Modern UI Aesthetics</div>
        <p style="font-size:0.9rem; color:#94a3b8; margin:0;">Utilize responsive Tailwind CSS design system tokens with subtle micro-animations and dark mode support.</p>
      </div>
      <div class="item">
        <div class="item-title">🛡️ Data Governance</div>
        <p style="font-size:0.9rem; color:#94a3b8; margin:0;">Isolate file storage outside the public web root and maintain immutable audit logging for all operations.</p>
      </div>
    </div>

    <h2>2. Developer Checklist</h2>
    <ul style="background: #0f172a; padding: 1.2rem 2rem; border-radius: 10px; border: 1px solid #334155;">
      <li>Verify MongoDB connection strings are properly injected via environment variables.</li>
      <li>Do not expose raw file system paths directly in client response payloads.</li>
      <li>Validate file size limits and MIME types before initiating server uploads.</li>
    </ul>

    <div class="alert">
      <strong>Confidentiality Notice:</strong> This document is intended solely for internal orientation and evaluation. Sandboxed execution is enforced.
    </div>
  </div>
</body>
</html>`;

  const html1Key = `custom_html_onboarding_${Date.now()}.html`;
  fs.writeFileSync(path.join(uploadDir, html1Key), html1Content, 'utf8');

  await Content.create({
    title: 'Internship Technical Evaluation & Best Practices (Interactive HTML)',
    description: 'Official interactive orientation handbook detailing codebase conventions, evaluation metrics, and security guidelines.',
    category: 'Onboarding',
    contentType: 'HTML',
    storageKey: html1Key,
    originalFilename: 'internship_technical_evaluation.html',
    mimeType: 'text/html',
    fileSize: Buffer.byteLength(html1Content),
    uploadedBy: { userId: adminUser._id || adminUser.id, name: adminUser.name, email: adminUser.email },
  });

  // 2. Create PDF Asset 1: Data Security Policy
  const pdf1Buffer = Buffer.from(
    `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 320 >>
stream
BT
/F1 18 Tf
50 720 Td
(INFORMATION SECURITY & DATA GOVERNANCE MANUAL 2026) Tj
0 -35 Td
/F1 11 Tf
(Confidential Internal Operating Document - Authorized Access Only) Tj
0 -30 Td
(1. Zero-Trust Access Control Policy) Tj
0 -18 Td
(   All API endpoints require cryptographically signed JSON Web Tokens.) Tj
0 -25 Td
(2. Data Encryption Standards) Tj
0 -18 Td
(   Database connections must enforce TLS/SSL encryption with MongoDB Atlas.) Tj
0 -25 Td
(3. Storage & Streaming Isolation) Tj
0 -18 Td
(   Content files are served exclusively through token-gated proxy streams.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000246 00000 n 
0000000315 00000 n 
trailer
1 0 R
startxref
685
%%EOF`
  );

  const pdf1Key = `custom_pdf_security_${Date.now()}.pdf`;
  fs.writeFileSync(path.join(uploadDir, pdf1Key), pdf1Buffer);

  await Content.create({
    title: 'Information Security & Data Governance Manual 2026 (PDF)',
    description: 'Comprehensive organizational security policy manual outlining zero-trust protocols, data encryption standards, and asset streaming rules.',
    category: 'Compliance',
    contentType: 'PDF',
    storageKey: pdf1Key,
    originalFilename: 'data_security_governance_manual_2026.pdf',
    mimeType: 'application/pdf',
    fileSize: pdf1Buffer.length,
    uploadedBy: { userId: adminUser._id || adminUser.id, name: adminUser.name, email: adminUser.email },
  });

  // 3. Create Video Asset: Architecture Overview
  const videoBuffer = Buffer.from(
    '000000186674797069736f6d0000020069736f6d69736f32617663316d703431', 'hex'
  );
  const videoKey = `custom_video_architecture_${Date.now()}.mp4`;
  fs.writeFileSync(path.join(uploadDir, videoKey), videoBuffer);

  await Content.create({
    title: 'Zero-Trust Architecture & Secure Streaming (Video Guide)',
    description: 'Technical presentation covering server-side authentication, HTTP Range video streaming, and object storage security.',
    category: 'Technical',
    contentType: 'VIDEO',
    storageKey: videoKey,
    originalFilename: 'zero_trust_architecture_overview.mp4',
    mimeType: 'video/mp4',
    fileSize: videoBuffer.length,
    uploadedBy: { userId: adminUser._id || adminUser.id, name: adminUser.name, email: adminUser.email },
  });

  // 4. Create HTML Asset 2: AI Safety Playbook
  const html2Content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Responsible AI Engineering Playbook</title>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; background: #090d16; color: #e2e8f0; padding: 2.5rem; line-height: 1.6; }
    .box { background: #131c2e; max-width: 850px; margin: 0 auto; padding: 2.5rem; border-radius: 16px; border: 1px solid #1e293b; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    h1 { color: #38bdf8; font-size: 1.8rem; margin-top: 0; }
    .tag { display: inline-block; background: #0284c7; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; margin-bottom: 1.5rem; }
    .section { background: #0b1322; padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem; border: 1px solid #1e293b; }
    .title { color: #7dd3fc; font-weight: 700; font-size: 1.1rem; margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  <div class="box">
    <span class="tag">Engineering Best Practices</span>
    <h1>Responsible AI Engineering & Code Quality Playbook</h1>
    <p>Guidelines for developing resilient, secure, and maintainable software systems using modern artificial intelligence tooling.</p>

    <div class="section">
      <div class="title">1. Secret Management & API Protection</div>
      <p style="margin:0; color:#94a3b8; font-size:0.9rem;">Never hardcode database passwords, private keys, or API tokens directly in source code files. Use strictly isolated .env environment files.</p>
    </div>

    <div class="section">
      <div class="title">2. Input Sanitization & Validation</div>
      <p style="margin:0; color:#94a3b8; font-size:0.9rem;">Validate all incoming payload fields using middleware libraries like express-validator before invoking database operations.</p>
    </div>

    <div class="section">
      <div class="title">3. Audit Trails & Observability</div>
      <p style="margin:0; color:#94a3b8; font-size:0.9rem;">Maintain structured audit logs for administrative transactions, user authentications, and file modifications.</p>
    </div>
  </div>
</body>
</html>`;

  const html2Key = `custom_html_ai_safety_${Date.now()}.html`;
  fs.writeFileSync(path.join(uploadDir, html2Key), html2Content, 'utf8');

  await Content.create({
    title: 'Responsible AI Engineering & Code Quality Playbook (HTML)',
    description: 'Interactive standards guide for secure secret management, payload validation, and system observability.',
    category: 'Engineering',
    contentType: 'HTML',
    storageKey: html2Key,
    originalFilename: 'responsible_ai_engineering_playbook.html',
    mimeType: 'text/html',
    fileSize: Buffer.byteLength(html2Content),
    uploadedBy: { userId: adminUser._id || adminUser.id, name: adminUser.name, email: adminUser.email },
  });

  await AuditLog.record({
    action: 'UPLOAD',
    adminEmail: adminUser.email,
    adminName: adminUser.name,
    details: 'Reseeded database with 100% original custom competition assets.',
  });

  console.log('[Reseed] Successfully reseeded MongoDB Atlas with custom, copyright-free content!');
  process.exit(0);
};

runReseed().catch(err => {
  console.error('[Reseed Error]:', err);
  process.exit(1);
});
