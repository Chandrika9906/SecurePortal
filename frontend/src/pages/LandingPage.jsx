import React from 'react';
import {
  ShieldCheck, Lock, Video, FileText, Code,
  Users, ArrowRight, Eye, Zap, CheckCircle2,
} from 'lucide-react';

export const LandingPage = ({ onShowLogin }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Secure Content Portal</span>
          </div>
          <button
            onClick={onShowLogin}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition"
          >
            Sign in <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6">
          <Lock className="w-3 h-3" />
          Google OAuth · Role-based access · Private file delivery
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight max-w-3xl">
          Internal content,{' '}
          <span className="text-brand-600">delivered safely.</span>
        </h1>

        <p className="mt-5 text-lg text-slate-500 max-w-lg leading-relaxed">
          A private portal for sharing training videos, policy documents and
          reference materials — with proper access control baked in from the start.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onShowLogin}
            className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-md transition text-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Sign in with Google
          </button>
          <button
            onClick={onShowLogin}
            className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl border border-slate-200 hover:border-brand-300 text-slate-600 hover:text-brand-700 font-semibold bg-white transition text-sm"
          >
            Try demo account →
          </button>
        </div>

        {/* trust badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-5">
          {[
            'HttpOnly cookie sessions',
            'Server-side role enforcement',
            'No public file URLs',
            'Sandboxed HTML viewer',
          ].map(t => (
            <span key={t} className="flex items-center gap-1.5 text-xs text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 px-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-10">
            How it works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Sign in with Google', desc: 'No passwords. Use your existing Google account — your role is assigned automatically on first login.' },
              { num: '02', title: 'Browse the library', desc: 'Find videos, PDFs and HTML guides uploaded by your admin, organised by category.' },
              { num: '03', title: 'Watch & read in-browser', desc: 'Content streams directly in the portal. Nothing to download, no external apps needed.' },
            ].map(({ num, title, desc }) => (
              <div key={num} className="relative pl-10">
                <span className="absolute left-0 top-0 text-3xl font-black text-slate-100 leading-none select-none">{num}</span>
                <h3 className="font-bold text-slate-800 text-sm mb-1.5 pt-1">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="py-16 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-10">
            What's protected and how
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Lock,
                color: 'bg-indigo-100 text-indigo-600',
                title: 'Google-only sign-in',
                desc: 'No password forms to attack. Access is tied to a verified Google identity and a server-assigned role.',
              },
              {
                icon: Eye,
                color: 'bg-blue-100 text-blue-600',
                title: 'Stream, not download',
                desc: 'Files are never exposed at a static URL. Every request is checked against your active session before a single byte is sent.',
              },
              {
                icon: Users,
                color: 'bg-violet-100 text-violet-600',
                title: 'Two enforced roles',
                desc: 'Admin and Viewer permissions are checked on the server for every request — hiding buttons in the UI is not enough.',
              },
              {
                icon: Video,
                color: 'bg-sky-100 text-sky-600',
                title: 'Range-request video',
                desc: 'MP4s are delivered via HTTP range streaming so playback starts instantly and seeking works without buffering the whole file.',
              },
              {
                icon: FileText,
                color: 'bg-red-100 text-red-500',
                title: 'In-browser PDF viewer',
                desc: 'Documents render inline with download and print controls removed — no direct link to the raw binary.',
              },
              {
                icon: Code,
                color: 'bg-emerald-100 text-emerald-600',
                title: 'Sandboxed HTML',
                desc: 'HTML content runs inside a sandboxed iframe, isolated from the parent app\'s cookies and storage.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-brand-200 transition">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1.5">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-14 px-6 bg-brand-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to take a look?</h2>
          <p className="text-brand-200 text-sm mb-6">
            Sign in with Google or use the demo account to explore the content library.
          </p>
          <button
            onClick={onShowLogin}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-brand-700 font-semibold text-sm shadow-md transition"
          >
            Get started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-100 text-slate-500 text-xs py-6 px-6 text-center border-t border-slate-200">
        <div className="flex items-center justify-center gap-2 mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
          <span className="text-slate-700 font-semibold text-sm">Secure Content Portal</span>
        </div>
        <p>Take-home project · Full-stack development track · Role-based access control</p>
      </footer>
    </div>
  );
};
