import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Heart } from 'lucide-react';

export interface PoppingLiveComment {
  id: string;
  sender_name: string;
  message: string;
  avatar_url?: string;
  city?: string;
  is_decree?: boolean;
  is_current_user?: boolean;
  created_at: number;
}

interface LivePouringCommentsProps {
  initialComments?: { sender_name: string; message: string; city?: string; is_decree?: boolean }[];
  isLive?: boolean;
  className?: string;
  simulatePouring?: boolean;
}

const LIVE_SAMPLE_COMMENTS = [
  { sender_name: 'Pastor Tendai', message: 'Hallelujah! The altar is on fire! 🔥', city: 'Harare', is_decree: true },
  { sender_name: 'Sister Chipo', message: 'I receive my supernatural speed! Amen! 🙏', city: 'Harare', is_decree: true },
  { sender_name: 'Tinashe M', message: 'Bulawayo connected in covenant faith! 🇿🇼', city: 'Bulawayo' },
  { sender_name: 'Grace Daniels', message: 'Dominion over every limitation today!', city: 'Harare' },
  { sender_name: 'Kuda Sibanda', message: 'Apostolic speed in this season! Fire! 🔥', city: 'Chitungwiza', is_decree: true },
  { sender_name: 'Nyasha C', message: 'Amen and Amen! Glory to God! 🕊️', city: 'Mutare' },
  { sender_name: 'Farai G', message: 'Taking notes from Gweru! Powerful teaching 📖', city: 'Gweru' },
  { sender_name: 'Rudo Moyo', message: 'Lord make a way! Standing in faith! 🙏', city: 'Harare' }
];

export const LivePouringComments: React.FC<LivePouringCommentsProps> = ({
  initialComments,
  isLive = true,
  className = '',
  simulatePouring = true
}) => {
  const [poppingComments, setPoppingComments] = useState<PoppingLiveComment[]>([]);
  const sampleIndexRef = useRef(0);

  // Helper to add a comment that pops up for exactly 1 second
  const addPoppingComment = (comment: Omit<PoppingLiveComment, 'id' | 'created_at'>) => {
    const newEntry: PoppingLiveComment = {
      ...comment,
      id: `pop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: Date.now()
    };

    setPoppingComments((prev) => {
      // Keep up to 4 comments at a time so they "pour" smoothly without crowding the video
      const updated = [...prev, newEntry];
      return updated.slice(-4);
    });

    // Exactly 1 second (1000ms) lifespan: remove this specific comment after 1 second
    setTimeout(() => {
      setPoppingComments((prev) => prev.filter((c) => c.id !== newEntry.id));
    }, 1100);
  };

  // Listen for real comment submissions anywhere in the app
  useEffect(() => {
    const handleCommentPopEvent = (e: any) => {
      const detail = e.detail;
      if (!detail || !detail.message) return;
      addPoppingComment({
        sender_name: detail.sender_name || detail.user || 'Believer',
        message: detail.message || detail.text,
        city: detail.city || 'Harare',
        is_decree: detail.is_decree || Boolean(detail.message?.toLowerCase().includes('amen') || detail.message?.toLowerCase().includes('receive')),
        is_current_user: Boolean(detail.is_current_user),
        avatar_url: detail.avatar_url
      });
    };

    window.addEventListener('gcz_live_comment_pop', handleCommentPopEvent);
    return () => window.removeEventListener('gcz_live_comment_pop', handleCommentPopEvent);
  }, []);

  // Show a couple of initial comments when opening stream
  useEffect(() => {
    if (initialComments && initialComments.length > 0) {
      initialComments.slice(0, 2).forEach((c, idx) => {
        setTimeout(() => {
          addPoppingComment(c);
        }, 400 + idx * 600);
      });
    }
  }, []);

  // Periodic simulated live pouring comments (every 2.5 to 4 seconds) to mimic TikTok / Instagram Live
  useEffect(() => {
    if (!simulatePouring || !isLive) return;

    const interval = setInterval(() => {
      const sample = LIVE_SAMPLE_COMMENTS[sampleIndexRef.current % LIVE_SAMPLE_COMMENTS.length];
      sampleIndexRef.current += 1;
      addPoppingComment(sample);
    }, 2800);

    return () => clearInterval(interval);
  }, [simulatePouring, isLive]);

  if (poppingComments.length === 0) {
    return null;
  }

  return (
    <div 
      className={`pointer-events-none flex flex-col justify-end space-y-1.5 overflow-hidden z-30 transition-all ${className}`}
      aria-live="polite"
    >
      {poppingComments.map((comment) => {
        const isSelf = comment.is_current_user;
        const initial = comment.sender_name ? comment.sender_name.charAt(0).toUpperCase() : 'G';

        return (
          <div
            key={comment.id}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs shadow-2xl backdrop-blur-md border animate-in fade-in slide-in-from-bottom-3 duration-200 transition-all ${
              isSelf
                ? 'bg-primary/90 text-primary-foreground border-amber-300/40 shadow-primary/30'
                : 'bg-black/75 text-white border-white/20'
            }`}
          >
            {/* Avatar or Initial circle */}
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              isSelf 
                ? 'bg-amber-300 text-slate-950 shadow-xs' 
                : 'bg-gradient-to-tr from-primary to-amber-400 text-primary-foreground'
            }`}>
              {comment.avatar_url ? (
                <img src={comment.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            {/* Sender and message */}
            <div className="flex items-center gap-1.5 min-w-0 max-w-[220px] sm:max-w-[260px] truncate">
              <span className={`font-bold text-[11px] shrink-0 truncate ${isSelf ? 'text-white' : 'text-primary'}`}>
                {isSelf ? 'You' : comment.sender_name}
              </span>
              <span className="text-white/95 text-[11px] leading-tight truncate">
                {comment.message}
              </span>
            </div>

            {/* Emoji or decree sparkle */}
            {comment.is_decree && (
              <Sparkles className="w-3 h-3 text-amber-300 shrink-0 animate-pulse ml-0.5" />
            )}
          </div>
        );
      })}
    </div>
  );
};
