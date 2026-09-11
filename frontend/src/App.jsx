import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Sidebar, TopBar } from './components/Sidebar';
import { ViewerLibraryPage } from './pages/ViewerLibraryPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminManagePage } from './pages/AdminManagePage';
import { UploadModal } from './components/UploadModal';
import { ToastContainer } from './components/ToastContainer';
import { useToast } from './hooks/useToast';
import { ShieldCheck, RefreshCw } from 'lucide-react';

const AppShell = () => {
  const { user, loading, isAdmin } = useAuth();
  const { toasts, show: showToast, dismiss } = useToast();
  const [currentTab, setCurrentTab] = useState('library');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (user) setCurrentTab(isAdmin ? 'dashboard' : 'library');
  }, [user?.role]);

  const handleTabChange = (tab) => {
    if (!isAdmin && (tab === 'dashboard' || tab === 'manage')) {
      showToast('Access denied — VIEWER role cannot access admin pages.', 'error');
      return;
    }
    setCurrentTab(tab);
  };

  const handleUpload = async (formData) => {
    setUploadLoading(true);
    try {
      const res = await fetch('/api/content/upload', {
        method: 'POST', body: formData, credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const fieldMessages = data.fields?.map(f => f.message).join(', ');
        throw new Error(fieldMessages || data.error || 'Upload failed.');
      }
      showToast(`"${formData.get('title')}" uploaded and secured successfully.`, 'success');
      setUploadOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/20">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <RefreshCw className="w-5 h-5 animate-spin text-brand-500" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Verifying session...</p>
      </div>
    );
  }

  // Not logged in → show Landing or Login
  if (!user) {
    if (showLogin) return <LoginPage onBack={() => setShowLogin(false)} />;
    return <LandingPage onShowLogin={() => setShowLogin(true)} />;
  }

  const tabTitle = {
    dashboard: 'Dashboard',
    manage: 'Content Manager',
    library: 'Content Library',
  }[currentTab] || 'Portal';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onOpenUpload={() => setUploadOpen(true)}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar setSidebarOpen={setSidebarOpen} title={tabTitle} />

        <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto bg-slate-50">
          {isAdmin && currentTab === 'dashboard' && (
            <AdminDashboardPage
              onNavigate={handleTabChange}
              onOpenUpload={() => setUploadOpen(true)}
            />
          )}
          {isAdmin && currentTab === 'manage' && (
            <AdminManagePage
              onOpenUpload={() => setUploadOpen(true)}
              onToast={showToast}
            />
          )}
          {currentTab === 'library' && <ViewerLibraryPage />}
        </main>
      </div>

      {isAdmin && (
        <UploadModal
          isOpen={uploadOpen}
          onUpload={handleUpload}
          onCancel={() => setUploadOpen(false)}
          loading={uploadLoading}
        />
      )}

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
