import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  LayoutDashboard,
  FolderKanban,
  Library,
  LogOut,
  Menu,
  X,
  UserCheck,
  Lock,
} from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab }) => {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav(isAdmin ? 'dashboard' : 'library')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg text-white leading-none tracking-tight flex items-center gap-2">
                Secure Content Portal
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Protected
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Enterprise Reference System</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {isAdmin && (
              <>
                <button
                  onClick={() => handleNav('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${currentTab === 'dashboard'
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>

                <button
                  onClick={() => handleNav('manage')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${currentTab === 'manage'
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                >
                  <FolderKanban className="w-4 h-4" />
                  Content Management
                </button>
              </>
            )}

            <button
              onClick={() => handleNav('library')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${currentTab === 'library'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
            >
              <Library className="w-4 h-4" />
              Content Library
            </button>
          </nav>

          {/* User Profile & Role Info */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <img
                src={user?.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-9 h-9 rounded-full ring-2 ring-brand-500/30 object-cover"
              />
              <div className="text-left">
                <div className="text-sm font-semibold text-white leading-tight">{user?.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${isAdmin
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                      }`}
                  >
                    {user?.role}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/50 hover:border-rose-500/30 transition title='Sign Out'"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 px-4 pt-3 pb-6 space-y-3 backdrop-blur-xl">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <img
              src={user?.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-semibold text-white text-sm">{user?.name}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase mt-1 ${isAdmin ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                  }`}
              >
                Role: {user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            {isAdmin && (
              <>
                <button
                  onClick={() => handleNav('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${currentTab === 'dashboard' ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Admin Dashboard
                </button>

                <button
                  onClick={() => handleNav('manage')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${currentTab === 'manage' ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                >
                  <FolderKanban className="w-5 h-5" />
                  Content Management
                </button>
              </>
            )}

            <button
              onClick={() => handleNav('library')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${currentTab === 'library' ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
            >
              <Library className="w-5 h-5" />
              Content Library
            </button>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
};
