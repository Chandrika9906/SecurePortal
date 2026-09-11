import { AlertTriangle, Trash2, X } from 'lucide-react';

export const DeleteConfirmModal = ({ isOpen, item, onConfirm, onCancel, loading }) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Delete Content?</h3>
            <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1 text-xs">
          <p className="text-slate-800 font-semibold truncate">"{item.title}"</p>
          <p className="text-slate-500">{item.contentType} • {item.category}</p>
          <p className="text-slate-400">{item.originalFilename}</p>
        </div>

        <p className="text-xs text-red-500 leading-relaxed">
          This will permanently remove the database record and delete the file from storage.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-sm transition disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : <Trash2 className="w-4 h-4" />}
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};
