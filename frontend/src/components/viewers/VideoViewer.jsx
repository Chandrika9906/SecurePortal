import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Shield, AlertCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const VideoViewer = ({ item }) => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [resumedTime, setResumedTime] = useState(null);

  const itemId = item.id || item._id;
  const storageKey = `vid_pos_${itemId}`;

  // Authenticated Protected Range Streaming Route
  const streamUrl = `/api/content/${itemId}/stream`;

  // Restore playback position on load
  const handleLoadedMetadata = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && videoRef.current) {
        const time = parseFloat(saved);
        if (!isNaN(time) && time > 3 && time < videoRef.current.duration - 5) {
          videoRef.current.currentTime = time;
          const mins = Math.floor(time / 60);
          const secs = Math.floor(time % 60).toString().padStart(2, '0');
          setResumedTime(`${mins}:${secs}`);
        }
      }
    } catch (e) {
      console.warn('Playback resume error:', e);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !videoRef.current.paused) {
      try {
        localStorage.setItem(storageKey, videoRef.current.currentTime.toString());
      } catch (e) {}
    }
  };

  const restartPlayback = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setResumedTime(null);
      try { localStorage.removeItem(storageKey); } catch (e) {}
    }
  };

  return (
    <div className="space-y-4">
      {/* Resumed Banner */}
      {resumedTime && (
        <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-brand-400" />
            <span>Resumed playback from timestamp <strong>{resumedTime}</strong></span>
          </div>
          <button
            onClick={restartPlayback}
            className="px-2.5 py-1 rounded-lg bg-brand-600/30 hover:bg-brand-600/50 text-[11px] font-bold text-white transition"
          >
            Start from Beginning
          </button>
        </div>
      )}

      {/* Video Container */}
      <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl aspect-video group">
        
        {/* HTML5 Video Element streaming from Range Endpoint */}
        <video
          ref={videoRef}
          src={streamUrl}
          controls
          controlsList="nodownload"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setError(true)}
          onContextMenu={(e) => e.preventDefault()}
          className="w-full h-full object-contain"
        />

        {/* Security Deterrent Watermark Overlay */}
        <div className="absolute top-4 right-4 z-10 pointer-events-none select-none opacity-40 hover:opacity-80 transition">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-700/50 text-[10px] font-mono text-slate-300 backdrop-blur-md">
            <Shield className="w-3.5 h-3.5 text-brand-400" />
            <span>PROTECTED STREAM • {user?.email}</span>
          </div>
        </div>

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/90 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-2" />
            <h4 className="text-lg font-bold text-white">Video Stream Unavailable</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Unable to load protected range stream. Ensure your authentication session is active.
            </p>
          </div>
        )}
      </div>

      {/* Security Architecture Callout */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200">Content Security Architecture:</strong> This video is delivered via server-side HTTP range requests (`/api/content/:id/stream`). Playback timestamps are saved locally to seamlessly resume across sessions.
        </div>
      </div>
    </div>
  );
};
