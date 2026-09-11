import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Video, FileText, Code, Eye, Upload,
  Activity, ArrowUpRight, Database, TrendingUp, Users,
  ShieldCheck, Clock, Plus, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ACTION_STYLES = {
  UPLOAD:        { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200',  label: 'Upload' },
  EDIT:          { cls: 'bg-blue-100 text-blue-700 border-blue-200',           label: 'Edit' },
  DELETE:        { cls: 'bg-red-100 text-red-600 border-red-200',              label: 'Delete' },
  LOGIN:         { cls: 'bg-slate-100 text-slate-600 border-slate-200',        label: 'Login' },
  ACCESS_DENIED: { cls: 'bg-amber-100 text-amber-700 border-amber-200',        label: 'Denied' },
};

const TYPE_CFG = {
  VIDEO: { color: 'bg-blue-100 text-blue-600',     bar: 'bg-blue-500' },
  PDF:   { color: 'bg-red-100 text-red-500',       bar: 'bg-red-500' },
  HTML:  { color: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-500' },
};

const StatCard = ({ label, value, icon: Icon, iconBg, sub, trend }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend != null && (
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          <TrendingUp className="w-3 h-3" /> {trend}
        </span>
      )}
    </div>
    <p className="text-3xl font-black text-slate-800">{value}</p>
    <p className="text-xs font-semibold text-slate-500 mt-1">{label}</p>
    {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

export const AdminDashboardPage = ({ onNavigate, onOpenUpload }) => {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageMode, setStorageMode] = useState('local');

  const load = async () => {
    try {
      setLoading(true);
      const res  = await fetch('/api/admin/stats', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setLogs(data.auditLogs || []);
        setStorageMode(data.storageMode || 'local');
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const total   = stats?.total ?? 0;
  const videos  = stats?.videos ?? 0;
  const pdfs    = stats?.pdfs ?? 0;
  const htmls   = stats?.htmls ?? 0;
  const views   = stats?.totalViews ?? 0;

  const storageLabel = {
    cloudinary: 'Cloudinary',
    supabase:   'Supabase',
    local:      'Local FS (Dev)',
  }[storageMode] || storageMode;

  const storageCls = storageMode === 'local'
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <div className="space-y-6">

      {/* ── Welcome banner ── */}
      <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-brand-600/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-brand-200 text-sm font-medium mb-1">Welcome back,</p>
            <h1 className="text-2xl font-black tracking-tight">{user?.name}</h1>
            <p className="text-brand-200 text-sm mt-1">
              {total} protected asset{total !== 1 ? 's' : ''} · {views} total views
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white/10 border-white/20 text-white`}>
              <Database className="w-3.5 h-3.5" /> {storageLabel}
            </span>
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-brand-700 text-sm font-bold shadow-sm hover:bg-brand-50 transition"
            >
              <Plus className="w-4 h-4" /> Upload
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(n => (
            <div key={n} className="bg-white border border-slate-200 rounded-2xl p-5 h-32 animate-pulse">
              <div className="w-10 h-10 bg-slate-100 rounded-xl mb-4" />
              <div className="h-7 bg-slate-100 rounded w-16 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Assets"  value={total}  icon={LayoutDashboard} iconBg="bg-indigo-100 text-indigo-600"   sub="All protected items" />
          <StatCard label="Total Views"   value={views}  icon={Eye}             iconBg="bg-brand-100 text-brand-600"     sub="Viewer accesses"     trend={views > 0 ? `${views}` : null} />
          <StatCard label="Videos"        value={videos} icon={Video}           iconBg="bg-blue-100 text-blue-600"       sub="Range-streamed MP4s" />
          <StatCard label="Documents"     value={pdfs + htmls} icon={FileText}  iconBg="bg-rose-100 text-rose-500"       sub={`${pdfs} PDF · ${htmls} HTML`} />
        </div>
      )}

      {/* ── Content breakdown + Quick actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Content type breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-brand-500" /> Content Breakdown
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(n => <div key={n} className="h-8 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : total === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No content yet.</p>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Videos', count: videos, type: 'VIDEO' },
                { label: 'PDFs',   count: pdfs,   type: 'PDF' },
                { label: 'HTML',   count: htmls,  type: 'HTML' },
              ].map(({ label, count, type }) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const cfg = TYPE_CFG[type];
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${cfg.color}`}>{label}</span>
                      <span className="text-xs text-slate-500">{count} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cfg.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-500" /> Quick Actions
          </h2>
          <div className="space-y-2">
            <button
              onClick={onOpenUpload}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 text-sm font-semibold transition"
            >
              <Upload className="w-4 h-4" /> Upload new asset
            </button>
            <button
              onClick={() => onNavigate('manage')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold transition"
            >
              <LayoutDashboard className="w-4 h-4" /> Manage all content
            </button>
            <button
              onClick={load}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold transition"
            >
              <RefreshCw className="w-4 h-4" /> Refresh stats
            </button>
          </div>
        </div>

        {/* Storage status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-500" /> System Status
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Auth',    value: 'Google OAuth',   ok: true },
              { label: 'Session', value: 'HttpOnly Cookie', ok: true },
              { label: 'Storage', value: storageLabel,      ok: storageMode !== 'local' },
              { label: 'RBAC',    value: 'Server-enforced', ok: true },
            ].map(({ label, value, ok }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{label}</span>
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent uploads + Audit log ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Recent uploads */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-brand-500" />
              <h2 className="text-sm font-bold text-slate-700">Recent Uploads</h2>
            </div>
            <button
              onClick={() => onNavigate('manage')}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(n => <div key={n} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : !stats?.recentUploads?.length ? (
            <div className="p-10 text-center">
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No uploads yet.</p>
              <button onClick={onOpenUpload} className="mt-2 text-xs text-brand-600 font-semibold hover:underline">Upload your first asset →</button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentUploads.map(item => {
                const cfg = TYPE_CFG[item.contentType] || {};
                return (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}>
                      {item.contentType === 'VIDEO' && <Video    className="w-4 h-4" />}
                      {item.contentType === 'PDF'   && <FileText className="w-4 h-4" />}
                      {item.contentType === 'HTML'  && <Code     className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-slate-600 flex items-center gap-1 justify-end">
                        <Eye className="w-3 h-3" /> {item.viewCount}
                      </p>
                      <p className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Audit log */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <Activity className="w-4 h-4 text-violet-500" />
            <h2 className="text-sm font-bold text-slate-700">Security Audit Trail</h2>
          </div>

          {loading ? (
            <div className="p-4 space-y-2">
              {[1,2,3,4].map(n => <div key={n} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : !logs.length ? (
            <div className="p-10 text-center">
              <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No audit events yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {logs.slice(0, 15).map((log, i) => {
                const style = ACTION_STYLES[log.action] || { cls: 'bg-slate-100 text-slate-500 border-slate-200', label: log.action };
                return (
                  <div key={log._id || log.id || i} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition">
                    <span className={`mt-0.5 text-[9px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${style.cls}`}>
                      {style.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 truncate">{log.details}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {log.adminName} · {new Date(log.createdAt || Date.now()).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
