import React, { useState, useEffect } from 'react';
import { Radio, Tv, Users, X, ChevronRight, Sparkles } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { LiveStreamViewer } from '../types';

interface FloatingLiveBroadcastProps {
  onOpenStream?: () => void;
  currentUser?: any;
  onWatchLive?: () => void;
  onOpenInteractiveModal?: () => void;
}

export const FloatingLiveBroadcast: React.FC<FloatingLiveBroadcastProps> = ({ 
  onOpenStream, 
  currentUser,
  onWatchLive,
  onOpenInteractiveModal
}) => {
  const [liveStatus, setLiveStatus] = useState(() => StorageService.getLiveSermonStatus());
  const [streamViewers, setStreamViewers] = useState<LiveStreamViewer[]>(() => StorageService.getStreamViewers());
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const handleStatusUpdate = (e: any) => {
      const updated = e?.detail || StorageService.getLiveSermonStatus();
      setLiveStatus(updated);
      if (updated?.isLive) {
        setIsDismissed(false); // Un-dismiss when live starts
      }
    };

    const handleBroadcastStarted = (e: any) => {
      const updated = e?.detail || StorageService.getLiveSermonStatus();
      setLiveStatus(updated);
      setIsDismissed(false);
      setIsMinimized(false);
    };

    const handleViewersUpdate = () => {
      setStreamViewers(StorageService.getStreamViewers());
    };

    window.addEventListener('gcz_live_status_updated', handleStatusUpdate);
    window.addEventListener('gcz_live_broadcast_started', handleBroadcastStarted);
    window.addEventListener('gcz_stream_viewers_updated', handleViewersUpdate);
    window.addEventListener('gcz_stream_viewer_joined', handleViewersUpdate);
    window.addEventListener('gcz_stream_viewer_left', handleViewersUpdate);

    return () => {
      window.removeEventListener('gcz_live_status_updated', handleStatusUpdate);
      window.removeEventListener('gcz_live_broadcast_started', handleBroadcastStarted);
      window.removeEventListener('gcz_stream_viewers_updated', handleViewersUpdate);
      window.removeEventListener('gcz_stream_viewer_joined', handleViewersUpdate);
      window.removeEventListener('gcz_stream_viewer_left', handleViewersUpdate);
    };
  }, []);

  if (!liveStatus?.isLive || isDismissed) {
    return null;
  }

  const viewerCount = Math.max(streamViewers.length, liveStatus.viewerCount || 1);

  if (isMinimized) {
    return (
      <div 
        id="floating-live-minimized"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-red-600 text-white shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all border border-white/20 animate-bounce"
        title="Live Broadcast Active - Click to expand"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
        <Radio className="w-4 h-4 animate-pulse" />
        <span className="text-xs font-black tracking-wide uppercase">LIVE</span>
      </div>
    );
  }

  return (
    <aside
      id="floating-live-broadcast-card"
      aria-label="Live Sanctuary Broadcast Notification"
      className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-40 w-[calc(100vw-24px)] max-w-[340px] bg-card/95 backdrop-blur-xl border border-destructive/50 rounded-2xl p-3.5 text-foreground shadow-xl transition-all"
    >
      {/* Header bar with LIVE pulse and Dismiss */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-destructive flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            LIVE BROADCAST NOW
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            id="btn-live-float-minimize"
            onClick={() => setIsMinimized(true)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary text-xs transition-colors"
            title="Minimize"
          >
            _
          </button>
          <button
            id="btn-live-float-close"
            onClick={() => setIsDismissed(true)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary transition-colors"
            title="Dismiss until next session"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Broadcast Title */}
      <div className="space-y-1 mb-3">
        <h4 className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
          {liveStatus.title || 'Church & Politics • Apostle Joe Daniels Live Broadcast'}
        </h4>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1 text-emerald-500 font-semibold">
            <Users className="w-3 h-3 text-emerald-500" />
            <span>{viewerCount} believers watching</span>
          </span>
          <span>•</span>
          <span className="text-primary font-semibold flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" />
            Sanctuary
          </span>
        </div>
      </div>

      {/* Stream Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          id="btn-live-float-stream"
          onClick={() => {
            if (onOpenInteractiveModal) onOpenInteractiveModal();
            if (onOpenStream) onOpenStream();
            window.dispatchEvent(new CustomEvent('gcz_open_live_stream'));
          }}
          className="w-full py-2 px-3 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Stream Now</span>
        </button>

        <button
          id="btn-live-float-watch-top"
          onClick={() => {
            if (onWatchLive) {
              onWatchLive();
            } else {
              window.dispatchEvent(new CustomEvent('gcz_navigate_tab', { detail: 'home' }));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="w-full py-2 px-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
        >
          <span>Watch on Top</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};

export default FloatingLiveBroadcast;
