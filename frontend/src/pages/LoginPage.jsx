import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, ShieldAlert, ArrowLeft, User, Settings } from 'lucide-react';

export const LoginPage = ({ onBack }) => {
  const { loginWithGoogle, demoLogin, authError, loading } = useAuth();
  const [localError, setLocalError] = useState('');

  const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '125774813734-o7fik4vrq290l3q76g47t7jsqr4je87j.apps.googleusercontent.com';
  const isGoogleConfigured =
    rawClientId &&
    rawClientId !== 'your-google-client-id.apps.googleusercontent.com' &&
    rawClientId.trim() !== '';

  const initGoogle = () => {
    if (!isGoogleConfigured || !window.google?.accounts?.id) return;
    try {
      window.google.accounts.id.initialize({
        client_id: rawClientId,
        callback: (response) => {
          if (response.credential) {
            loginWithGoogle(response.credential).catch((err) => setLocalError(err.message));
          }
        },
      });
      const btn = document.getElementById('googleSignInBtn');
      if (btn) {
        window.google.accounts.id.renderButton(btn, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          shape: 'pill',
          text: 'signin_with',
        });
      }
    } catch (e) {
      console.warn('Google GSI warning:', e.message);
    }
  };

  useEffect(() => {
    if (!isGoogleConfigured) return;
    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (script) {
        script.addEventListener('load', initGoogle);
        return () => script.removeEventListener('load', initGoogle);
      }
    }
  }, [isGoogleConfigured, rawClientId]);

  const handleDemo = async (role) => {
    try {
      setLocalError('');
      await demoLogin(role);
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">

      {/* Back link */}
      {onBack && (
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </button>
        </div>
      )}

      {/* Logo + title */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center shadow-md shadow-brand-600/30">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-800">Sign in</h1>
        <p className="mt-1 text-sm text-slate-400">
          Secure Content Portal · Full-stack take-home project
        </p>
      </div>

      {/* Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-md px-8 py-8 space-y-5">

          {/* Security notice */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-slate-600">
            <Lock className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
            <p>
              <span className="font-semibold text-slate-700">Google OAuth only.</span>{' '}
              No passwords. Your access level is assigned by your account role.
            </p>
          </div>

          {/* Error */}
          {(authError || localError) && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{authError || localError}</span>
            </div>
          )}

          {/* Google SSO */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 text-center">
              Google Single Sign-On
            </p>
            {isGoogleConfigured ? (
              <div id="googleSignInBtn" className="flex justify-center min-h-[44px]" />
            ) : (
              <>
                <button disabled className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-400 text-sm font-medium cursor-not-allowed opacity-60 shadow-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Sign in with Google
                </button>
                <p className="text-[10px] text-center text-slate-400">
                  Add <code className="bg-slate-100 px-1 rounded text-amber-600">VITE_GOOGLE_CLIENT_ID</code> to <code className="bg-slate-100 px-1 rounded text-slate-500">frontend/.env</code> to enable.
                </p>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold">Or try a demo account</span>
            </div>
          </div>

          {/* TWO demo buttons — Admin + Viewer */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDemo('ADMIN')}
              disabled={loading}
              className="flex flex-col items-center gap-1.5 px-4 py-3.5 rounded-xl
                         bg-amber-50 hover:bg-amber-100 border border-amber-200
                         text-amber-700 text-sm font-semibold transition disabled:opacity-50"
            >
              <Settings className="w-4 h-4" />
              <span>{loading ? 'Signing in…' : 'Demo Admin'}</span>
              <span className="text-[10px] font-normal text-amber-600">Upload · Edit · Delete</span>
            </button>
            <button
              onClick={() => handleDemo('VIEWER')}
              disabled={loading}
              className="flex flex-col items-center gap-1.5 px-4 py-3.5 rounded-xl
                         bg-brand-50 hover:bg-brand-100 border border-brand-200
                         text-brand-700 text-sm font-semibold transition disabled:opacity-50"
            >
              <User className="w-4 h-4" />
              <span>{loading ? 'Signing in…' : 'Demo Viewer'}</span>
              <span className="text-[10px] font-normal text-brand-600">Browse · Watch · Read</span>
            </button>
          </div>

          <p className="text-[10px] text-center text-slate-400">
            Demo accounts use pre-seeded credentials — no Google account needed.
          </p>
        </div>
      </div>
    </div>
  );
};
