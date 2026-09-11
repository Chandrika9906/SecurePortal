import { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, Video, FileText, Code, Eye, Layers } from 'lucide-react';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { EditModal } from '../components/EditModal';
import { SkeletonRow } from '../components/Skeletons';

const TYPE_ICON = {
  VIDEO: { icon: Video, cls: 'text-brand-600 bg-brand-100' },
  PDF: { icon: FileText, cls: 'text-rose-500 bg-rose-100' },
  HTML: { icon: Code, cls: 'text-emerald-600 bg-emerald-100' },
};

const fmt = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const AdminManagePage = ({ onOpenUpload, onToast }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'All') params.set('contentType', typeFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/content?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setList(data.data || []);
    } catch (e) { onToast?.('Failed to load content.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [typeFilter]);

  const handleEdit = async (fields) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/content/${editItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      onToast?.(`Updated "${fields.title}"`, 'success');
      setEditItem(null);
      load();
    } catch (e) { onToast?.(e.message, 'error'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/content/${deleteItem.id}`, {
        method: 'DELETE', credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      onToast?.(`Deleted "${deleteItem.title}"`, 'success');
      setDeleteItem(null);
      load();
    } catch (e) { onToast?.(e.message, 'error'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Content Manager</h1>
          <p className="text-sm text-slate-500 mt-1">Upload, edit, and delete reference assets</p>
        </div>
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Upload Asset
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="relative flex-1 max-w-sm">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 placeholder:text-slate-400 text-sm transition"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          {['All', 'VIDEO', 'PDF', 'HTML'].map(t => (
            <button key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                typeFilter === t ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}>
              {t === 'All' ? 'All Types' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-5">Asset</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4">Views</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading
                ? [1,2,3].map(n => (
                  <tr key={n} className="border-b border-slate-100"><td colSpan={7}><SkeletonRow /></td></tr>
                ))
                : list.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Layers className="w-10 h-10" />
                      <p className="text-sm font-semibold text-slate-500">No assets found</p>
                      <button onClick={onOpenUpload} className="text-brand-600 hover:text-brand-800 text-xs font-medium">Upload your first asset →</button>
                    </div>
                  </td></tr>
                ) : list.map(item => {
                  const { icon: Icon, cls } = TYPE_ICON[item.contentType] || {};
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-5">
                        <p className="font-semibold text-slate-800 text-sm truncate max-w-xs">{item.title}</p>
                        <p className="text-slate-400 mt-0.5 truncate max-w-xs">{item.originalFilename}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${cls}`}>
                          {Icon && <Icon className="w-3.5 h-3.5" />} {item.contentType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{item.category}</td>
                      <td className="py-3.5 px-4 text-slate-500">{fmt(item.fileSize)}</td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {item.viewCount}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditItem(item)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-[11px] font-bold transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteItem(item)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-bold transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="lg:hidden divide-y divide-slate-100">
          {loading ? [1,2,3].map(n => <SkeletonRow key={n} />) :
           list.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No assets found. <button onClick={onOpenUpload} className="text-brand-600">Upload one →</button>
            </div>
           ) : list.map(item => {
            const { icon: Icon, cls } = TYPE_ICON[item.contentType] || {};
            return (
              <div key={item.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${cls}`}>
                    {Icon && <Icon className="w-3 h-3" />} {item.contentType}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditItem(item)} className="flex-1 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-bold flex items-center justify-center gap-1">
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => setDeleteItem(item)} className="flex-1 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold flex items-center justify-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <EditModal isOpen={!!editItem} item={editItem} onSave={handleEdit} onCancel={() => setEditItem(null)} loading={actionLoading} />
      <DeleteConfirmModal isOpen={!!deleteItem} item={deleteItem} onConfirm={handleDelete} onCancel={() => setDeleteItem(null)} loading={actionLoading} />
    </div>
  );
};
