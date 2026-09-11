import React, { useState, useEffect } from 'react';
import { FileText, Shield, Lock, RefreshCw, AlertCircle, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PdfViewer = ({ item }) => {
  const { user } = useAuth();
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullHeight, setIsFullHeight] = useState(false);

  const itemId = item.id || item._id;

  useEffect(() => {
    let active = true;
    const fetchProtectedPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch PDF binary array buffer using authenticated session credentials
        const res = await fetch(`/api/content/${itemId}/stream`, {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error(`Failed to load protected PDF document (${res.status})`);
        }

        const blob = await res.blob();
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);

        if (active) {
          setBlobUrl(url);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProtectedPdf();

    return () => {
      active = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [itemId]);

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
  const resetZoom = () => setZoomLevel(100);

  return (
    <div className="space-y-4">
      {/* PDF Viewing Container */}
      <div className={`relative w-full rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
        isFullHeight ? 'h-[85vh]' : 'h-[650px]'
      }`}>
        
        {/* PDF Top Bar Controls */}
        <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="text-sm font-semibold text-white truncate max-w-sm">{item.title}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-300">
              <button
                onClick={zoomOut}
                disabled={zoomLevel <= 50}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition disabled:opacity-30"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetZoom}
                className="px-2 py-0.5 hover:bg-slate-800 rounded text-[11px] font-mono font-bold text-slate-300"
                title="Reset Zoom"
              >
                {zoomLevel}%
              </button>
              <button
                onClick={zoomIn}
                disabled={zoomLevel >= 200}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition disabled:opacity-30"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reading Mode Toggle */}
            <button
              onClick={() => setIsFullHeight(!isFullHeight)}
              className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition flex items-center gap-1 text-xs"
              title={isFullHeight ? "Exit Full Height" : "Full Height Reading Mode"}
            >
              {isFullHeight ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline text-[11px] font-medium">{isFullHeight ? 'Default View' : 'Full Height'}</span>
            </button>

            <span className="hidden md:flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <Lock className="w-3 h-3" /> Protected PDF
            </span>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden">
          
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-400" />
              <p className="text-sm font-medium">Decrypting & loading protected document...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950">
              <AlertCircle className="w-12 h-12 text-rose-500 mb-2" />
              <h4 className="text-lg font-bold text-white">Document Access Error</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md">{error}</p>
            </div>
          )}

          {blobUrl && (
            <iframe
              src={`${blobUrl}#zoom=${zoomLevel}&toolbar=0&navpanes=0&scrollbar=1`}
              title={item.title}
              onContextMenu={(e) => e.preventDefault()}
              className="w-full h-full border-0 select-none"
            />
          )}

          {/* Deterrent Security Watermark */}
          <div className="absolute bottom-4 right-4 pointer-events-none select-none opacity-40 hover:opacity-75 transition">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/50 text-[10px] font-mono text-slate-300 backdrop-blur-md">
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span>CONFIDENTIAL • LICENSED TO {user?.email?.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Architecture Callout */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <Shield className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200">PDF Protection Model:</strong> The raw PDF binary is stored strictly in server private storage (`private_uploads`). The binary is delivered directly into browser memory via an authenticated byte stream. Direct raw static download endpoints are disabled.
        </div>
      </div>
    </div>
  );
};
