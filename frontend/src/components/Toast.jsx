import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  const styles = {
    success: 'bg-white border-emerald-200 text-emerald-700',
    error:   'bg-white border-red-200 text-red-700',
    warning: 'bg-white border-amber-200 text-amber-700',
    info:    'bg-white border-blue-200 text-blue-700',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error:   <XCircle     className="w-5 h-5 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info:    <Info         className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short max-w-md">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${
          styles[type] || styles.info
        }`}
      >
        {icons[type]}
        <div className="text-sm font-medium pr-2">{message}</div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
