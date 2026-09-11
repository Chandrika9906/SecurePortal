const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    category: { type: String, default: 'General', trim: true, maxlength: 100 },
    contentType: { type: String, enum: ['VIDEO', 'PDF', 'HTML'], required: true },
    storageKey: { type: String, required: true },
    storageMode: { type: String, enum: ['supabase', 'local', 'cloudinary'], default: 'local' },
    originalFilename: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadedBy: {
      userId: String,
      name: String,
      email: String,
    },
    viewCount: { type: Number, default: 0 },
    lastViewedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for fast filtering
contentSchema.index({ contentType: 1 });
contentSchema.index({ category: 1 });
contentSchema.index({ createdAt: -1 });
contentSchema.index({ title: 'text', description: 'text' });

const inMemoryContent = [];

const mongoose_model = () => mongoose.models.Content || mongoose.model('Content', contentSchema);

const Content = {
  async create(data) {
    try {
      if (mongoose.connection.readyState === 1) {
        return await mongoose_model().create(data);
      }
    } catch (e) { console.warn('[Content] Mongo create error:', e.message); }
    const newDoc = {
      _id: 'cnt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      viewCount: 0, ...data, createdAt: new Date(), updatedAt: new Date(),
    };
    inMemoryContent.unshift(newDoc);
    return newDoc;
  },

  async findAll({ category, contentType, search, sort } = {}) {
    try {
      if (mongoose.connection.readyState === 1) {
        const filter = {};
        if (category && category !== 'All') filter.category = category;
        if (contentType && contentType !== 'All') filter.contentType = contentType;
        if (search) filter.$text = { $search: search };

        const sortMap = {
          newest: { createdAt: -1 },
          oldest: { createdAt: 1 },
          title: { title: 1 },
          views: { viewCount: -1 },
        };

        return await mongoose_model()
          .find(filter)
          .sort(sortMap[sort] || { createdAt: -1 });
      }
    } catch (e) {}

    let items = [...inMemoryContent];
    if (category && category !== 'All') items = items.filter(i => i.category === category);
    if (contentType && contentType !== 'All') items = items.filter(i => i.contentType === contentType);
    if (search) {
      const t = search.toLowerCase();
      items = items.filter(i =>
        (i.title || '').toLowerCase().includes(t) ||
        (i.description || '').toLowerCase().includes(t)
      );
    }
    return items;
  },

  async findById(id) {
    try {
      if (mongoose.connection.readyState === 1) return await mongoose_model().findById(id);
    } catch (e) {}
    return inMemoryContent.find(c => c._id === id || c.id === id) || null;
  },

  async updateById(id, data) {
    try {
      if (mongoose.connection.readyState === 1) {
        return await mongoose_model().findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
      }
    } catch (e) {}
    const i = inMemoryContent.findIndex(c => c._id === id || c.id === id);
    if (i >= 0) { inMemoryContent[i] = { ...inMemoryContent[i], ...data, updatedAt: new Date() }; return inMemoryContent[i]; }
    return null;
  },

  async deleteById(id) {
    try {
      if (mongoose.connection.readyState === 1) return await mongoose_model().findByIdAndDelete(id);
    } catch (e) {}
    const i = inMemoryContent.findIndex(c => c._id === id || c.id === id);
    if (i >= 0) { const d = inMemoryContent[i]; inMemoryContent.splice(i, 1); return d; }
    return null;
  },

  async incrementViews(id) {
    try {
      if (mongoose.connection.readyState === 1) {
        return await mongoose_model().findByIdAndUpdate(
          id, { $inc: { viewCount: 1 }, lastViewedAt: new Date() }, { new: true }
        );
      }
    } catch (e) {}
    const item = inMemoryContent.find(c => c._id === id || c.id === id);
    if (item) { item.viewCount = (item.viewCount || 0) + 1; item.lastViewedAt = new Date(); return item; }
    return null;
  },

  async getStats() {
    let items = [];
    try {
      items = mongoose.connection.readyState === 1
        ? await mongoose_model().find()
        : inMemoryContent;
    } catch (e) { items = inMemoryContent; }

    const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
    const recent = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    return {
      total: items.length,
      videos: items.filter(i => i.contentType === 'VIDEO').length,
      pdfs: items.filter(i => i.contentType === 'PDF').length,
      htmls: items.filter(i => i.contentType === 'HTML').length,
      totalViews: items.reduce((s, i) => s + (i.viewCount || 0), 0),
      categories,
      recentUploads: recent.map(i => ({
        id: i._id || i.id,
        title: i.title,
        contentType: i.contentType,
        category: i.category,
        createdAt: i.createdAt,
        viewCount: i.viewCount || 0,
      })),
    };
  }
};

module.exports = Content;
