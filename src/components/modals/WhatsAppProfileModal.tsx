import React, { useState } from 'react';
import { X, Camera, Edit3, Check, Copy, LogOut, ShieldCheck, Crown, Hash, Phone, Sparkles } from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storageService';
import { ImagePickerModal } from './ImagePickerModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (u: User) => void;
  onLogout: () => void;
  onOpenSwitchRole?: () => void;
}

export const WhatsAppProfileModal: React.FC<Props> = ({ isOpen, onClose, currentUser, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser.full_name);
  const [showPicker, setShowPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  if (!isOpen) return null;

  const saveName = () => {
    if (!nameInput.trim()) return;
    const u = StorageService.updateUserProfile({ full_name: nameInput.trim() });
    onUpdateUser(u);
    setIsEditing(false);
  };

  const savePhoto = (url: string) => {
    const u = StorageService.updateUserProfile({ avatar_url: url });
    onUpdateUser(u);
  };

  const copyId = async () => {
    await navigator.clipboard.writeText(currentUser.member_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isApostle = currentUser.role === 'super_admin';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[420px] h-full bg-[#0E0E10] border-l border-white/10 flex flex-col">
        <div className="relative h-[38%] min-h-[280px] shrink-0 overflow-hidden bg-zinc-900">
          {currentUser.avatar_url? (
            <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E10] via-[#0E0E10]/60 to-black/10" />
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-[10px] font-bold text-white flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" />
              {isApostle? 'APOSTLE' : 'ELITE'}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5 flex gap-4 items-end">
            <div className="relative">
              <div className="w-[84px] h-[84px] rounded-[20px] overflow-hidden border-[3px] border-[#0E0E10] bg-zinc-800">
                {currentUser.avatar_url? (
                  <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-black text-white">
                    {currentUser.full_name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <button onClick={() => setShowPicker(true)} className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center border-2 border-[#0E0E10]">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              {isEditing? (
                <div className="flex gap-2">
                  <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="flex-1 bg-black/50 border border-violet-500 rounded-xl px-3 py-2 text-sm text-white outline-none" autoFocus />
                  <button onClick={saveName} className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-bold text-white truncate">{currentUser.full_name}</h2>
                    <button onClick={() => setIsEditing(true)} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <Edit3 className="w-3 h-3 text-white/70" />
                    </button>
                  </div>
                  <p className="text-[11px] text-white/60 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {isApostle? 'Preaching with power' : 'Available in Christ'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0E0E10]">
          <div className="rounded-[18px] bg-white/[0.04] border border-white/[0.06] divide-y divide-white/[0.06] overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
                <Hash className="w-4 h-4 text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-white/30">MEMBER ID</p>
                <p className="text-[13px] font-semibold text-white font-mono truncate">{currentUser.member_id}</p>
              </div>
              <button onClick={copyId} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                {copied? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/60" />}
              </button>
            </div>
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
                <Phone className="w-4 h-4 text-white/70" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-white/30">PHONE</p>
                <p className="text-[13px] font-semibold text-white">{currentUser.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-white/30">STATUS</p>
                <p className="text-[13px] font-semibold text-white">Gold Verified</p>
              </div>
            </div>
          </div>

          <div className="rounded-[18px] bg-gradient-to-br from-violet-600/15 to-fuchsia-600/10 border border-violet-500/20 p-4">
            <p className="text-[10px] font-bold tracking-widest text-violet-300">DECLARATION</p>
            <p className="text-[13px] text-white/80 mt-2 italic">
              {isApostle? 'Apostle of Jesus Christ - Preaching Kingdom with power' : 'Available in Christ - Praying without ceasing'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setShowPicker(true)} className="h-12 rounded-xl bg-white text-black font-bold text-[13px] flex items-center justify-center gap-2">
              <Camera className="w-4 h-4" />
              Change Photo
            </button>
            <button onClick={() => setShowLogout(true)} className="h-12 rounded-xl bg-white/5 border border-white/10 text-white/70 font-bold text-[13px] flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>

        {showLogout && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="w-full bg-[#1A1A1F] border border-white/10 rounded-[20px] p-5 text-center">
              <h4 className="font-bold text-white">Log out?</h4>
              <p className="text-xs text-white/50 mt-1">You can log back anytime</p>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowLogout(false)} className="flex-1 h-11 rounded-xl bg-white/10 text-white font-bold text-sm">Cancel</button>
                <button onClick={() => { setShowLogout(false); onLogout(); onClose(); }} className="flex-1 h-11 rounded-xl bg-red-600 text-white font-bold text-sm">Log out</button>
              </div>
            </div>
          </div>
        )}

        <ImagePickerModal isOpen={showPicker} onClose={() => setShowPicker(false)} onSelectImage={savePhoto} currentImage={currentUser.avatar_url} title="Update photo" subtitle="Choose from device or gallery" />
      </div>
    </div>
  );
};