import React, { useState } from 'react';
import {
  X, Camera, Edit3, Check, Copy, LogOut,
  ShieldCheck, ArrowLeft, Sparkles, Crown
} from 'lucide-react';
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

export const WhatsAppProfileModal: React.FC<Props> = ({
  isOpen, onClose, currentUser, onUpdateUser, onLogout
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser.full_name);
  const [aboutInput] = useState(
    currentUser.role === 'super_admin'
     ? 'Apostle of Jesus Christ • Preaching the Kingdom with power & speed'
      : 'Available in Christ • Praying without ceasing 🙏'
  );
  const [copiedId, setCopiedId] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    const updated = StorageService.updateUserProfile({ full_name: nameInput.trim() });
    onUpdateUser(updated);
    setIsEditingName(false);
  };

  const handleSavePhoto = (url: string) => {
    const updated = StorageService.updateUserProfile({ avatar_url: url });
    onUpdateUser(updated);
    confetti({ particleCount: 40, spread: 80, origin: { y: 0.6 }, colors: ['#a78bfa','#f59e0b','#10b981'] });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUser.member_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const badgeType = currentUser.verified_badge || currentUser.badge_type || (currentUser.is_verified? 'gold' : 'none');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-3 animate-fade-in" onClick={onClose}>
      <div
        className="relative bg-[#0f0f12] text-white rounded-[32px] max-w-[380px] w-full overflow-hidden shadow-[0_20px_80px_-20px_rgba(139,92,246,0.5)] border border-white/10 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER GRADIENT */}
        <div className="relative h-[140px] shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3),transparent_60%)]" />

          <div className="relative p-4 flex justify-between items-center">
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/30">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-[11px] font-semibold tracking-widest uppercase">
              <Sparkles className="w-3 h-3" /> Premium Profile
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/30">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AVATAR SECTION - FLOATING */}
        <div className="px-6 -mt-16 relative z-10">
          <div className="flex items-end gap-4">
            <div className="relative group cursor-pointer" onClick={() => setShowPhotoPicker(true)}>
              <div className="w-24 h-24 rounded-[24px] p-1 bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-xl">
                <div className="w-full h-full rounded-[20px] overflow-hidden bg-zinc-900 flex items-center justify-center">
                  {currentUser.avatar_url? (
                    <img src={currentUser.avatar_url} alt={currentUser.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black">{currentUser.full_name.slice(0,2).toUpperCase()}</span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg border-2 border-[#0f0f12]">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <div className="pb-2 flex-1 min-w-0">
              {isEditingName? (
                <div className="flex gap-1.5">
                  <input value={nameInput} onChange={e=>setNameInput(e.target.value)} className="flex-1 bg-white/10 border border-violet-500/50 rounded-xl px-3 py-1.5 text-sm outline-none" autoFocus />
                  <button onClick={handleSaveName} className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center"><Check className="w-4 h-4"/></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-[18px] truncate leading-tight">{currentUser.full_name}</h2>
                  {badgeType!== 'none' && <VerifiedBadge type={badgeType} size="sm" />}
                </div>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 border border-violet-500/30 text-violet-200 flex items-center gap-1">
                  <Crown className="w-3 h-3"/> {currentUser.role === 'super_admin'? 'Apostle' : currentUser.role.replace(/_/g,' ')}
                </span>
                <span className="text-[11px] text-white/50 flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400"/> Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-3 backdrop-blur-md">
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Member ID</p>
              <button onClick={handleCopy} className="mt-1 flex items-center gap-2 text-sm font-mono font-semibold">
                <span className="truncate">{currentUser.member_id.slice(0,12)}...</span>
                {copiedId? <Check className="w-3.5 h-3.5 text-emerald-400"/> : <Copy className="w-3.5 h-3.5 opacity-50"/>}
              </button>
            </div>
            <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-3">
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Phone</p>
              <p className="mt-1 text-sm font-semibold font-mono truncate">{currentUser.phone}</p>
            </div>
          </div>

          {/* About */}
          <div className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/20 blur-[30px] rounded-full" />
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">About & Status</p>
            <p className="text-[13px] leading-relaxed text-white/80 italic">"{aboutInput}"</p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={()=>setShowPhotoPicker(true)} className="h-12 rounded-2xl bg-white text-black text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-zinc-100 transition">
              <Camera className="w-4 h-4"/> Change Photo
            </button>
            <button onClick={()=>setShowLogoutConfirm(true)} className="h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition">
              <LogOut className="w-4 h-4"/> Log out
            </button>
          </div>
        </div>

        {/* Logout Confirm */}
        {showLogoutConfirm && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-zinc-900 border border-white/10 rounded-[20px] w-full p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto"><LogOut/></div>
              <h4 className="font-bold mt-3">Log out?</h4>
              <p className="text-xs text-white/50 mt-1">You can log back anytime</p>
              <div className="flex gap-2 mt-5">
                <button onClick={()=>setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl bg-white/10 text-sm font-bold">Cancel</button>
                <button onClick={()=>{ setShowLogoutConfirm(false); onLogout(); onClose(); }} className="flex-1 py-3 rounded-xl bg-red-600 text-sm font-bold">Log out</button>
              </div>
            </div>
          </div>
        )}

        <ImagePickerModal isOpen={showPhotoPicker} onClose={()=>setShowPhotoPicker(false)} onSelectImage={handleSavePhoto} currentImage={currentUser.avatar_url} title="Update photo" subtitle="Choose from device or Apostle gallery" />
      </div>
    </div>
  );
};