import React, { useState } from 'react';
import { Share2, X, Check, Copy, Send, Sparkles, BookOpen, Calendar, MapPin, Heart } from 'lucide-react';
import { Testimony, PrayerRequest, ChurchEvent } from '../../types';

interface WhatsAppShareModalProps {
  post?: Testimony | null;
  prayer?: PrayerRequest | null;
  event?: ChurchEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  post,
  prayer,
  event,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || (!post && !prayer && !event)) return null;

  const appUrl = window.location.origin;

  let shareText = '';
  let shareTitle = 'Share to WhatsApp';

  if (post) {
    shareTitle = 'Share Post to WhatsApp';
    shareText = `*Gateway International Church Zimbabwe*\nLead Pastor: Apostle Joe Daniels\n\n📌 *${post.title}*\n${post.scripture_tag ? `📖 *Scripture:* ${post.scripture_tag}\n` : ''}"${post.content}"\n\n👤 Shared by: ${post.user_name} (${post.user_handle || '@gateway_member'})\n\n📲 Connect and read full prophetic testimonies in the Gateway App:\n${appUrl}`;
  } else if (prayer) {
    shareTitle = 'Share Prayer to Cell';
    shareText = `🙏 *Gateway International Church - Prayer Wall*\n"Bearing one another's burdens in faith"\n\n🏷️ *Category:* ${prayer.category}\n👤 *Petitioner:* ${prayer.is_anonymous ? 'Anonymous Covenant Partner' : prayer.user_name}\n\n"${prayer.request_text}"\n\n${prayer.apostle_notes ? `✨ *Apostle Joe Daniels' Decree:* ${prayer.apostle_notes}\n\n` : ''}🤝 Stand in agreement on the Gateway Connect App:\n${appUrl}`;
  } else if (event) {
    shareTitle = 'Share Church Service / Event';
    shareText = `🏛️ *Gateway International Church Zimbabwe*\n${event.title}\n\n📅 Date: ${event.date} • Time: ${event.time}\n📍 Location: ${event.location}\n🎙️ Minister: ${event.speaker}\n\n"${event.description}"\n\nJoin us live or attend in fellowship on Gateway Connect:\n${appUrl}`;
  }

  const handleOpenWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="w-full max-w-[92vw] sm:max-w-md bg-[#001122] border border-[#D4AF37]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Header */}
        <div className="px-4 py-3 bg-[#00172e] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Share2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-[#D4AF37]">
              {shareTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Card Preview (Safe bounded box - No mobile screen overlap) */}
        <div className="p-4 space-y-3.5 overflow-y-auto max-h-[70vh]">
          <div className="bg-[#001F3F] border border-white/15 rounded-2xl p-3.5 space-y-3 shadow-inner">
            
            {/* Church branding bar */}
            <div className="flex items-center justify-between text-[10px] text-white/60 pb-2 border-b border-white/10">
              <span className="font-bold text-[#D4AF37] tracking-wider uppercase">
                Gateway International Church
              </span>
              <span>Apostle Joe Daniels</span>
            </div>

            {/* Post Picture if available */}
            {post?.image_url && (
              <div className="w-full rounded-xl overflow-hidden max-h-48 sm:max-h-56 bg-black/40 border border-white/10">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Event Banner if available */}
            {event?.banner_url && (
              <div className="w-full rounded-xl overflow-hidden max-h-48 sm:max-h-56 bg-black/40 border border-white/10">
                <img
                  src={event.banner_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Scripture and Category pill row */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {post && (
                <>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    {post.category}
                  </span>
                  {post.scripture_tag && (
                    <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-bold flex items-center gap-1">
                      <BookOpen className="w-2.5 h-2.5" />
                      <span>{post.scripture_tag}</span>
                    </span>
                  )}
                </>
              )}

              {prayer && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5" />
                  <span>Altar Prayer: {prayer.category}</span>
                </span>
              )}

              {event && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" />
                  <span>{event.category}</span>
                </span>
              )}
            </div>

            {/* Content Display */}
            {post && (
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-white leading-snug">
                  {post.title}
                </h4>
                <p className="text-xs text-white/80 leading-relaxed italic line-clamp-4">
                  "{post.content}"
                </p>
              </div>
            )}

            {prayer && (
              <div className="space-y-1.5">
                <h4 className="font-bold text-xs sm:text-sm text-white leading-snug flex items-center gap-1.5">
                  <span>Altar Request</span>
                  <span className="text-white/60 font-normal text-[11px]">• {prayer.is_anonymous ? 'Anonymous' : prayer.user_name}</span>
                </h4>
                <p className="text-xs text-white/80 leading-relaxed italic line-clamp-4 bg-black/20 p-2.5 rounded-lg border border-white/5">
                  "{prayer.request_text}"
                </p>
                {prayer.apostle_notes && (
                  <p className="text-[11px] text-[#D4AF37] bg-[#D4AF37]/10 p-2 rounded border border-[#D4AF37]/20">
                    <strong>Apostle Daniels:</strong> {prayer.apostle_notes}
                  </p>
                )}
              </div>
            )}

            {event && (
              <div className="space-y-1.5">
                <h4 className="font-bold text-xs sm:text-sm text-white leading-snug">
                  {event.title}
                </h4>
                <p className="text-xs text-white/80 leading-relaxed line-clamp-3">
                  {event.description}
                </p>
                <div className="text-[11px] text-white/70 space-y-0.5 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-[#D4AF37]" />
                    <span>{event.date} • {event.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#D4AF37]" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Author / Minister stamp */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-[#D4AF37]/40">
                <img
                  src={post?.user_avatar || '/assets/apostle_joe_daniels_main.jpg'}
                  alt={post?.user_name || 'Gateway'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-white block">
                  {post?.user_name || event?.speaker || (prayer?.is_anonymous ? 'Gateway Prayer Partner' : prayer?.user_name)}
                </span>
                <span className="text-white/40 text-[9px]">
                  {post?.user_handle || '@gateway_church'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-3.5 bg-[#00172e] border-t border-white/10 flex flex-col sm:flex-row items-center gap-2">
          <button
            id="btn-whatsapp-share-now"
            onClick={handleOpenWhatsApp}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4 -rotate-12" />
            <span>Open & Share to WhatsApp</span>
          </button>
          
          <button
            onClick={handleCopy}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
