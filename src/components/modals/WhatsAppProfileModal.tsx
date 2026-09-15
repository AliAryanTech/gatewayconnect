import React, { useState } from 'react';
import { X, Camera, Edit3, Check, Copy, LogOut, Crown, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storageService';
import { ImagePickerModal } from './ImagePickerModal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (u: User) => void;
  onLogout: () => void;
};

export const WhatsAppProfileModal: React.FC<Props> = (props) => {
  const { isOpen, onClose, currentUser, onUpdateUser, onLogout } = props;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser.full_name);
  const [showPicker, setShowPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  if (!isOpen) return null;

  const saveName = () => {
    if (!name.trim()) return;
    const u = StorageService.updateUserProfile({ full_name: name.trim() });
    onUpdateUser(u);
    setEditing(false);
  };

  const savePhoto = (url: string) => {
    const u = StorageService.updateUserProfile({ avatar_url: url });
    onUpdateUser(u);
  };

  const isApostle = currentUser.role === 'super_admin';

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={onClose}>
      <div className="absolute inset-0">
        {currentUser.avatar_url? (
          <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover opacity-40" />
        ) : (
          <div className="w-full h-full bg-zinc-900" />
        )}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[30px]" />
      </div>

      <div className="relative z-10 flex justify-between items-center p-6">
        <p className="text-[11px] tracking-widest font-black text-white/40">COVENANT SYSTEM</p>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div onClick={(e) => e.stopPropagation()} className="relative z-10 flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-[1100px] w-full mx-auto overflow-auto">

        <div className="lg:w-[42%]">
          <div className="rounded-[28px] bg-white/5 border border-white/10 p-1">
            <div className="rounded-[24px] overflow-hidden bg-black/50 aspect-[4/5] relative">
              {currentUser.avatar_url? (
                <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white">{currentUser.full_name.slice(0, 2)}</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                {editing? (
                  <div className="flex gap-2">
                    <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white outline-none" autoFocus />
                    <button onClick={saveName} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center"><Check className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-[26px] font-black text-white leading-none">{currentUser.full_name}</h1>
                      <button onClick={() => setEditing(true)} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><Edit3 className="w-3 h-3 text-white" /></button>
                    </div>
                    <p className="text-[12px] text-white/60 mt-2 flex items-center gap-1"><Sparkles className="w-3 h-3" />{isApostle? 'Apostle' : 'Elite Member'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => setShowPicker(true)} className="mt-4 w-full h-12 rounded-full bg-white text-black font-bold text-[12px] flex items-center justify-center gap-2">
            <Camera className="w-4 h-4" /> CHANGE PHOTO
          </button>
        </div>

        <div className="lg:w-[58%] flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[18px] bg-white/5 border border-white/10 p-4">
              <Zap className="w-4 h-4 text-violet-300" />
              <p className="text-[10px] text-white/30 font-bold mt-3">LEVEL</p>
              <p className="text-[20px] font-black text-white">{isApostle? '∞' : '12'}</p>
            </div>
            <div className="rounded-[18px] bg-white/5 border border-white/10 p-4">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <p className="text-[10px] text-white/30 font-bold mt-3">STATUS</p>
              <p className="text-[16px] font-bold text-white">Verified</p>
            </div>
            <div className="rounded-[18px] bg-white/5 border border-white/10 p-4">
              <Crown className="w-4 h-4 text-amber-300" />
              <p className="text-[10px] text-white/30 font-bold mt-3">RANK</p>
              <p className="text-[16px] font-bold text-white">{isApostle? 'Apostle' : 'Elite'}</p>
            </div>
          </div>

          <div className="rounded-[20px] bg-white/5 border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <p className="text-[10px] font-black tracking-widest text-white/40">IDENTITY VAULT</p>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="p-4 flex justify-between items-center">
              <div><p className="text-[10px] text-white/30 font-bold">MEMBER ID</p><p className="text-[13px] font-mono font-bold text-white mt-1">{currentUser.member_id}</p></div>
              <button onClick={async () => { await navigator.clipboard.writeText(currentUser.member_id); setCopied(true); setTimeout(() => setCopied(false), 1200); }} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                {copied? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/60" />}
              </button>
            </