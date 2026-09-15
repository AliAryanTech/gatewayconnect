import React, { useState } from 'react';
import { X, Camera, Edit3, Check, Copy, LogOut, ShieldCheck, Sparkles, Crown, Zap, Star, Quote } from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storageService';
import { ImagePickerModal } from './ImagePickerModal';
import { VerifiedBadge } from '../common/VerifiedBadge';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (u: User) => void;
  onLogout: () => void;
}

export const WhatsAppProfileModal: React.FC<Props> = ({ isOpen, onClose, currentUser, onUpdateUser, onLogout }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser.full_name);
  const [copied, setCopied] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  if (!isOpen) return null;

  const saveName = () => {
    if (!nameInput.trim()) return;
    const u = StorageService.updateUserProfile({ full_name: nameInput.trim() });
    onUpdateUser(u);
    setIsEditingName(false);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 }, colors: ['#8b5cf6','#ec4899','#f59e0b'] });
  };

  const savePhoto = (url: string) => {
    const u = StorageService.updateUserProfile({ avatar_url: url });
    onUpdateUser(u);
    confetti({ particleCount: 60, spread: 90, origin: { y: 0.5 } });
  };

  const copyId = () => {
    navigator.clipboard.writeText(currentUser.member_id);
    setCopied(true);
    setTimeout(()=>setCopied(false), 2000);
  };

  const badgeType = currentUser.verified_badge || currentUser.badge_type || (currentUser.is_verified? 'gold' : 'none');
  const isApostle = currentUser.role === 'super_admin';

  return (
    <div className="fixed inset-0 z-50 bg-[#050507]/90 backdrop-blur-2xl flex items-center justify-center p-3 animate-in fade-in" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="relative w-full max-w-[390px] rounded-[36px] overflow-hidden bg-[#0A0A0F] border border-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_30px_100px_-20px_rgba(124,58,237,0.5)] flex flex-col max-h-[92vh]">

        {/* TOP AURA */}
        <div className="relative h-[180px] shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#ec4899]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30" />
          <div className="absolute -top-24 -right-24 w-[300px] h-[300px] bg-white/20 blur-[60px] rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-[250px] h-[250px] bg-fuchsia-300/30 blur-[50px] rounded-full" />

          {/* Top Nav */}
          <div className="relative z-10 p-5 flex justify-between">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition"><X className="w-5 h-5"/></button>
            <div className="px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/20 text-[10px] tracking-[0.2em] font-black text-white/80 flex items-center gap-2">
              <Star className="w-3 h-3 fill-white" /> COVENANT ELITE
            </div>
          </div>

          {/* Floating Orbs */}
          <div className="absolute bottom-4 left-6 flex gap-2">
            <div className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-yellow-300" /> Level {isApostle? '∞' : '12'}
            </div>
            <div className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-300" /> Verified Soul
            </div>
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className="relative px-6 pb-6 -mt-14 z-10">
          {/* Avatar + Name */}
          <div className="flex gap-4 items-end">
            <div className="relative group" onClick={()=>setShowPhotoPicker(true)}>
              {/* Animated Ring */}
              <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-[6px] opacity-80 group-hover:opacity-100 transition" />
              <div className="relative w-[96px] h-[96px] rounded-[24px] p-[3px] bg-gradient-to-br from-white to-white/40">
                <div className="w-full h-full rounded-[21px] overflow-hidden bg-black">
                  {currentUser.avatar_url? <img src={currentUser.avatar_url} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black bg-zinc-900">{currentUser.full_name.slice(0,2).toUpperCase()}</div>}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-xl border-2 border-[#0A0A0F] group-hover:rotate-12 transition">
                <Camera className="w-4 h-4" />
              </div>
              {isApostle && <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"><Crown className="w-4 h-4 text-black" /></div>}
            </div>

            <div className="flex-1 min-w-0 pb-1">
              {isEditingName? (
                <div className="flex gap-2">
                  <input value={nameInput} onChange={e=>setNameInput(e.target.value)} className="flex-1 bg-white/10 border border-violet-500 rounded-xl px-3 py-2 text-sm outline-none" autoFocus />
                  <button onClick={saveName} className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center"><Check className="w-4 h-4 text-white"/></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-black tracking-tight leading-none truncate">{currentUser.full_name}</h2>
                    <button onClick={()=>setIsEditingName(true)} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"><Edit3 className="w-3 h-3"/></button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    {badgeType!=='none' && <VerifiedBadge type={badgeType} size="sm" />}
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold tracking-wide">{isApostle? 'APOSTLE • SUPER ADMIN' : currentUser.role.replace(/_/g,' ').toUpperCase()}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ROYAL STATS */}
          <div className="mt-6 grid grid-cols-3 gap-2.5">
            {[
              { label: 'MEMBER ID', value: currentUser.member_id.slice(0,8), action: copyId, icon: copied? Check: Copy },
              { label: 'PHONE', value: currentUser.phone.slice(-4), full: currentUser.phone, icon: ShieldCheck },
              { label: 'STATUS', value: 'Anointed', icon: Sparkles },
            ].map((s,i)=>(
              <button key={i} onClick={s.action} className="group rounded-[18px] bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] p-3 text-left backdrop-blur-md transition">
                <div className="flex justify-between items-center">
                  <p className="text-[9px] tracking-[0.15em] text-white/40 font-bold">{s.label}</p>
                  <s.icon className={`w-3 h-3 ${copied && i===0? 'text-emerald-400' : 'text-white/30 group-hover:text-white/60'}`} />
                </div>
                <p className="mt-1.5 text-[13px] font-bold font-mono truncate">{i===0 && copied? 'COPIED!' : s.value}</p>
              </button>
            ))}
          </div>

          {/* ABOUT - Premium Quote Card */}
          <div className="mt-4 rounded-[20px] bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-violet-600/20 blur-2xl rounded-full group-hover:bg-violet-600/30 transition" />
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0"><Quote className="w-4 h-4 text-white" /></div>
              <div>
                <p className="text-[10px] tracking-widest text-white/30 font-bold mb-1">DIVINE DECLARATION</p>
                <p className="text-[13px] leading-[1.5] text-white/80 font-medium italic">
                  {isApostle? 'Apostle of Jesus Christ • Preaching the Kingdom with power & speed' : 'Available in Christ • Praying without ceasing 🙏 Walking in dominion.'}
                </p>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-5 grid grid-cols-[1.2fr_0.8fr] gap-3">
            <button onClick={()=>setShowPhotoPicker(true)} className="h-[52px] rounded-[16px] bg-white text-black font-black text-[13px] tracking-wide flex items-center justify-center gap-2 hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-[0_10px_30px_-10px_rgba(255,255,255,0.5)]">
              <Camera className="w-4 h-4" /> UPGRADE PHOTO
            </button>
            <button onClick={()=>setShowLogout(true)} className="h-[52px] rounded-[16px] bg-[#1a1a1f] border border-white/10 text-white/70 font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition">
              <LogOut className="w-4 h-4" /> LOGOUT
            </button>
          </div>

          <p className="text-center text-[10px] text-white/20 tracking-widest mt-4 font-medium">COVENANT SECURE • ENCRYPTED • ANOINTED</p>
        </div>

        {/* Logout Modal */}
        {showLogout && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in">
            <div className="w-full bg-[#14141a] border border-white/10 rounded-[24px] p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center mx-auto"><LogOut className="w-7 h-7"/></div>
              <h3 className="font-black text-lg mt-4">Leave Covenant?</h3>
              <p className="text-xs text-white/50 mt-1">You can return anytime with your number</p>
              <div className="flex gap-3 mt-6">
                <button onClick={()=>setShowLogout(false)} className="flex-1 h-11 rounded-xl bg-white/10 font-bold text-sm">Stay</button>
                <button onClick={()=>{ setShowLogout(false); onLogout(); onClose(); }} className="flex-1 h-11 rounded-xl bg-red-600 font-bold text-sm">Logout</button>
              </div>
            </div>
          </div>
        )}

        <ImagePickerModal isOpen={showPhotoPicker} onClose={()=>setShowPhotoPicker(false)} onSelectImage={savePhoto} currentImage={currentUser.avatar_url} title="Upgrade Anointing Photo" subtitle="Choose from device or Apostle Joe Daniels gallery" />
      </div>
    </div>
  );
};