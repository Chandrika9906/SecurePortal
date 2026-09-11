import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'bg-white border-emerald-200 text-emerald-700',
  error:   'bg-white border-red-200 text-red-700',
  warning: 'bg-white border-amber-200 text-amber-700',
  info:    'bg-white border-blue-200 text-blue-700',
};

const iconColors = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-blue-500',
};

export const ToastContainer = ({ toasts, dismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const Icon = icons[toast.type] || Info;
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg pointer-events-auto ${colors[toast.type] || colors.info}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 p-1 rounded-lg hover:bg-slate-100 transition text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
