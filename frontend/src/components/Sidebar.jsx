import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, LayoutDashboard, FolderKanban, Library, LogOut,
  ChevronDown, Menu, X, Plus,
} from 'lucide-react';

const roleStyles = {
  ADMIN: 'bg-amber-100 text-amber-700 border border-amber-200',
  VIEWER: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
};

export const Sidebar = ({ currentTab, setCurrentTab, onOpenUpload, sidebarOpen, setSidebarOpen }) => {
  const { user, isAdmin, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = [
    { id: 'library', icon: Library, label: 'Content Library' },
    ...(isAdmin ? [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'manage',    icon: FolderKanban,    label: 'Content Manager' },
    ] : []),
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 w-60 flex flex-col
        bg-white border-r border-slate-200 shadow-sm
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:flex lg:shrink-0
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-800 truncate">Secure Portal</div>
            <div className="text-[10px] text-slate-400 truncate">Enterprise Edition</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload button (admin only) */}
        {isAdmin && (
          <div className="px-4 pt-4">
            <button
              onClick={() => { onOpenUpload(); setSidebarOpen(false); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                         bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold
                         shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Upload Asset
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setCurrentTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                currentTab === id
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${currentTab === id ? 'text-brand-600' : 'text-slate-400'}`} />
              {label}
            </button>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-100 p-3">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(p => !p)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              <img
                src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`}
                alt={user?.name}
                className="w-8 h-8 rounded-full shrink-0 object-cover ring-2 ring-brand-100"
              />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{user?.name}</p>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${roleStyles[user?.role]}`}>
                  {user?.role}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { logout(); setProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 text-sm font-medium transition"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

/* Mobile TopBar */
export const TopBar = ({ setSidebarOpen, title }) => {
  return (
    <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 h-14 px-4 bg-white border-b border-slate-200 shadow-sm">
      <button
        onClick={() => setSidebarOpen(true)}
        className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-brand-600" />
        <span className="font-bold text-slate-800 text-sm">{title}</span>
      </div>
    </header>
  );
};
