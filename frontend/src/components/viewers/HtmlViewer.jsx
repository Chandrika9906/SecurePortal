import React, { useState, useEffect } from 'react';
import { Code, Shield, Lock, RefreshCw, AlertCircle, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HtmlViewer = ({ item }) => {
  const { user } = useAuth();
  const [htmlDoc, setHtmlDoc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemId = item.id || item._id;

  useEffect(() => {
    let active = true;
    const fetchSandboxedHtml = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/content/${itemId}/stream`, {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error(`Failed to load HTML content (${res.status})`);
        }

        const text = await res.text();
        if (active) {
          setHtmlDoc(text);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSandboxedHtml();

    return () => {
      active = false;
    };
  }, [itemId]);

  return (
    <div className="space-y-4">
      {/* HTML Viewer Container */}
      <div className="relative w-full h-[650px] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Control Bar */}
        <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold text-white truncate max-w-sm">{item.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <Lock className="w-3 h-3" /> Sandboxed Iframe (Script Isolated)
            </span>
          </div>
        </div>

        {/* Sandboxed Body */}
        <div className="relative flex-1 bg-slate-950">
          
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-sm font-medium">Fetching & sandboxing HTML document...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950">
              <AlertCircle className="w-12 h-12 text-rose-500 mb-2" />
              <h4 className="text-lg font-bold text-white">Content Access Error</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md">{error}</p>
            </div>
          )}

          {htmlDoc && (
            <iframe
              srcDoc={htmlDoc}
              title={item.title}
              sandbox="allow-scripts"
              onContextMenu={(e) => e.preventDefault()}
              className="w-full h-full border-0 bg-slate-900"
            />
          )}

          {/* Watermark overlay */}
          <div className="absolute bottom-4 right-4 pointer-events-none select-none opacity-40 hover:opacity-75 transition">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-700/50 text-[10px] font-mono text-slate-300 backdrop-blur-md">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>ISOLATED SANDBOX • {user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Architecture Callout */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200">HTML Sandbox Security Model:</strong> The uploaded HTML is served via <code>srcDoc</code> within a sandboxed &lt;iframe&gt; with <code>sandbox="allow-scripts"</code>. The iframe cannot access parent application session tokens, parent DOM elements, or perform cross-origin actions.
        </div>
      </div>
    </div>
  );
};
