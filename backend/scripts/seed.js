const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Content = require('../models/Content');
const AuditLog = require('../models/AuditLog');

const uploadDir = path.resolve(process.env.STORAGE_PATH || './private_uploads');

const seedSampleData = async () => {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 1. Seed Default Admin and Viewer Users
    const adminUser = await User.createOrUpdate({
      email: 'admin@enterprise.com',
      name: 'Sarah Jenkins (Admin)',
      picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      role: 'ADMIN',
    });

    const viewerUser = await User.createOrUpdate({
      email: 'viewer@enterprise.com',
      name: 'Alex Rivera (Viewer)',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'VIEWER',
    });

    // Check if content already exists
    const existingContent = await Content.findAll({});
    if (existingContent && existingContent.length > 0) {
      console.log('[Seed] Content already exists. Skipping file generation.');
      return;
    }

    console.log('[Seed] Seeding sample enterprise training content...');

    // 2. Create Sample HTML File
    const sampleHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Security Best Practices Guide 2026</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc; line-height: 1.6; }
    .card { background: #1e293b; padding: 2rem; border-radius: 12px; border: 1px solid #334155; max-width: 800px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
    h1 { color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 0.5rem; }
    h2 { color: #38bdf8; margin-top: 1.5rem; }
    .badge { display: inline-block; background: #0284c7; color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; margin-bottom: 1rem; }
    ul { background: #0f172a; padding: 1rem 2rem; border-radius: 8px; border-left: 4px solid #10b981; }
    li { margin-bottom: 0.5rem; }
    .alert { background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #fca5a5; padding: 1rem; border-radius: 8px; margin-top: 1.5rem; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">CONFIDENTIAL INTERNAL TRAINING</span>
    <h1>Enterprise Data Protection & Security Guidelines</h1>
    <p>Welcome to the 2026 Organizational Information Security Module. This interactive reference provides baseline protocols for accessing internal systems and handling sensitive training assets.</p>
    
    <h2>1. Access Control & Authentication</h2>
    <ul>
      <li>Never share your single sign-on credentials or authentication tokens.</li>
      <li>Session cookies are encrypted with HttpOnly flags to prevent client-side script tampering.</li>
      <li>Always log out when departing your workstation.</li>
    </ul>

    <h2>2. Content Safeguards</h2>
    <ul>
      <li>All training video streams and document views are token-gated and monitored.</li>
      <li>Exporting or downloading proprietary PDFs without explicit written authorization is strictly prohibited.</li>
    </ul>

    <div class="alert">
      <strong>Notice:</strong> This HTML document is rendered in a sandboxed execution context to guarantee isolation from parent application storage.
    </div>
  </div>
</body>
</html>`;

    const htmlStorageKey = `seed_html_${Date.now()}.html`;
    fs.writeFileSync(path.join(uploadDir, htmlStorageKey), sampleHtmlContent, 'utf8');

    await Content.create({
      title: 'Enterprise Data Protection Guidelines (Interactive HTML)',
      description: 'Comprehensive interactive internal reference guide covering data classification, credential hygiene, and secure asset management protocols.',
      category: 'Compliance',
      contentType: 'HTML',
      storageKey: htmlStorageKey,
      originalFilename: 'enterprise_security_guidelines.html',
      mimeType: 'text/html',
      fileSize: Buffer.byteLength(sampleHtmlContent),
      uploadedBy: {
        userId: adminUser._id || adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
      },
    });

    // 3. Create Sample PDF File Buffer
    // A minimal valid PDF file syntax stream
    const samplePdfBuffer = Buffer.from(
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
<< /Length 215 >>
stream
BT
/F1 20 Tf
50 720 Td
(SECURE CONTENT PORTAL - TRAINING HANDBOOK 2026) Tj
0 -40 Td
/F1 12 Tf
(Confidential Internal Organization Material) Tj
0 -30 Td
(1. Role Based Access Control is strictly enforced on the server.) Tj
0 -20 Td
(2. Direct storage file paths are never exposed to client browsers.) Tj
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
<< /Size 6 /Root 1 0 R >>
startxref
580
%%EOF`
    );

    const pdfStorageKey = `seed_pdf_${Date.now()}.pdf`;
    fs.writeFileSync(path.join(uploadDir, pdfStorageKey), samplePdfBuffer);

    await Content.create({
      title: 'Employee Training Handbook 2026 (PDF Document)',
      description: 'Official organizational handbook detailing standard operating procedures, role permissions, and compliance specifications.',
      category: 'Onboarding',
      contentType: 'PDF',
      storageKey: pdfStorageKey,
      originalFilename: 'employee_training_handbook_2026.pdf',
      mimeType: 'application/pdf',
      fileSize: samplePdfBuffer.length,
      uploadedBy: {
        userId: adminUser._id || adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
      },
    });

    // 4. Create Sample Video File Buffer
    // Create a working test video file or sample MP4 video buffer
    // Public domain sample MP4 snippet placeholder or valid MP4 header
    const sampleVideoBuffer = Buffer.from(
      '000000186674797069736f6d0000020069736f6d69736f32617663316d703431', 'hex'
    );
    const videoStorageKey = `seed_video_${Date.now()}.mp4`;
    fs.writeFileSync(path.join(uploadDir, videoStorageKey), sampleVideoBuffer);

    await Content.create({
      title: 'System Security Overview & Architecture (Video Walkthrough)',
      description: 'Executive video presentation explaining server-side role-based access control, HTTP range video streaming, and storage security.',
      category: 'Technical',
      contentType: 'VIDEO',
      storageKey: videoStorageKey,
      originalFilename: 'system_security_overview.mp4',
      mimeType: 'video/mp4',
      fileSize: sampleVideoBuffer.length,
      uploadedBy: {
        userId: adminUser._id || adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
      },
    });

    await AuditLog.record({
      action: 'UPLOAD',
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      details: 'Automated database seed completed with 3 sample content items.',
    });

    console.log('[Seed] Sample enterprise content successfully seeded!');
  } catch (err) {
    console.error('[Seed Error]:', err.message);
  }
};

module.exports = { seedSampleData };
