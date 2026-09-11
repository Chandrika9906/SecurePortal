import { useEffect, useState, useRef } from 'react';
import {
  X, Upload, CheckCircle2, AlertCircle, Video, FileText, Code, Loader2, Cloud
} from 'lucide-react';

const CATEGORIES = ['Onboarding', 'Compliance', 'Technical', 'HR & Culture', 'General Reference'];

const TYPE_CONFIG = {
  VIDEO: {
    label: 'Video',
    icon: Video,
    color: 'border-brand-400 bg-brand-50 text-brand-700',
    accepts: '.mp4,.webm,.ogv',
    hint: 'MP4, WebM, OGV — max 100 MB',
  },
  PDF: {
    label: 'PDF Document',
    icon: FileText,
    color: 'border-red-400 bg-red-50 text-red-700',
    accepts: '.pdf',
    hint: 'PDF only — max 100 MB',
  },
  HTML: {
    label: 'HTML Module',
    icon: Code,
    color: 'border-emerald-400 bg-emerald-50 text-emerald-700',
    accepts: '.html,.htm',
    hint: 'HTML/HTM only — max 100 MB',
  },
};

export const UploadModal = ({ isOpen, onUpload, onCancel, loading }) => {
  const [form, setForm] = useState({
    title: '', description: '', category: 'Onboarding', contentType: 'VIDEO',
  });
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setForm({ title: '', description: '', category: 'Onboarding', contentType: 'VIDEO' });
      setFile(null);
      setErrors({});
      setProgress(0);
    }
  }, [isOpen]);

  // Simulate progress bar while uploading
  useEffect(() => {
    if (loading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + Math.random() * 12, 90));
      }, 300);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [loading]);

  if (!isOpen) return null;

  const tc = TYPE_CONFIG[form.contentType];
  const Icon = tc.icon;

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (form.title.length > 200) e.title = 'Title must be under 200 characters.';
    if (!file) e.file = 'Please select a file to upload.';
    return e;
  };

  const handleFile = (f) => {
    if (!f) return;
    setErrors(prev => ({ ...prev, file: '' }));
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    const validExts = tc.accepts.split(',');
    if (!validExts.includes(ext)) {
      setErrors(prev => ({ ...prev, file: `Invalid file type ${ext}. Expected: ${tc.accepts}` }));
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file: 'File exceeds 100 MB limit.' }));
      return;
    }
    setFile(f);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }

    const fd = new FormData();
    fd.append('title', form.title.trim());
    fd.append('description', form.description.trim());
    fd.append('category', form.category);
    fd.append('contentType', form.contentType);
    fd.append('file', file);
    onUpload(fd);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center">
              <Upload className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Upload Asset</h2>
              <p className="text-xs text-slate-400">Private storage · Server-side validation</p>
            </div>
          </div>
          <button onClick={onCancel} disabled={loading} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Content type selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Content Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                const Ic = cfg.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setForm(f => ({ ...f, contentType: key })); setFile(null); setErrors({}); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition ${
                      form.contentType === key ? cfg.color : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <Ic className="w-5 h-5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Security Awareness Training 2026"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400 placeholder:text-slate-400 transition ${
                errors.title ? 'border-red-400' : 'border-slate-300'
              }`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Category + Description row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400 transition"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief summary..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400 placeholder:text-slate-400 transition resize-none"
              />
            </div>
          </div>

          {/* File drop zone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              File <span className="text-red-500">*</span>
            </label>
            <div
              onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition ${
                dragActive ? 'border-brand-400 bg-brand-50' :
                file ? 'border-emerald-400 bg-emerald-50' :
                errors.file ? 'border-red-400 bg-red-50' :
                'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <input ref={fileInputRef} type="file" accept={tc.accepts} onChange={e => handleFile(e.target.files[0])} className="hidden" />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-800 truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto shadow-sm">
                    <Icon className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600 font-medium">Drop file here or click to browse</p>
                  <p className="text-xs text-slate-400">{tc.hint}</p>
                </div>
              )}
            </div>
            {errors.file && <p className="text-xs text-red-500 mt-1.5">{errors.file}</p>}
          </div>

          {/* Upload progress */}
          {loading && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-brand-500" /> Uploading to secure private storage...
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onCancel} disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition">
              Cancel
            </button>
            <button type="submit" disabled={loading || !file}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-sm transition disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {loading ? 'Uploading...' : 'Upload & Secure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
