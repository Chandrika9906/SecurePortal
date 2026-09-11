import { useState, useEffect } from 'react';
import { Edit3, X, Save, Loader2 } from 'lucide-react';

export const EditModal = ({ isOpen, item, onSave, onCancel, loading }) => {
  const [form, setForm] = useState({ title: '', description: '', category: 'General' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setForm({ title: item.title || '', description: item.description || '', category: item.category || 'General' });
      setErrors({});
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = {};
    if (!form.title.trim()) e2.title = 'Title is required.';
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    onSave({ title: form.title.trim(), description: form.description.trim(), category: form.category.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Edit Metadata</h2>
              <p className="text-xs text-slate-400">File content is not affected</p>
            </div>
          </div>
          <button onClick={onCancel} disabled={loading} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400 transition ${
                errors.title ? 'border-red-400' : 'border-slate-300'
              }`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Category</label>
            <input
              type="text"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400 transition"
              placeholder="e.g. Compliance, Technical..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400 transition resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onCancel} disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-sm transition disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
