import React, { useState } from 'react';
import { X, Camera, Edit3, Check, Copy, LogOut, Crown, ShieldCheck, Zap, Sparkles, Settings, LogOut as LogoutIcon } from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storageService';
import { ImagePickerModal } from './ImagePickerModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (u: User) => void;
  onLogout: () => void;
}

export const WhatsAppProfileModal: React.FC<Props> = ({ isOpen, onClose, currentUser, onUpdateUser, onLogout }) => {
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
      {/* BACKGROUND - Full Screen Blur */}
      <div className="absolute inset-0">
        {currentUser.avatar_url? <img src={currentUser.avatar_url} className="w-full h-full object-cover opacity-40" alt="" /> : <div className="w-full h-full bg-gradient-to-br from-violet-900 via-[#0E0E10] to-fuchsia-900" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 backdrop-blur-[30px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(124,58,237,0.4),transparent_70%)]" />
      </div>

      {/* TOP BAR - System Header */}
      <div className="relative z-10 flex justify-between items-center p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white/80" />
          </div>
          <div>
            <p className="text-[11px] tracking-[0.3em] font-black text-white/40">COVENANT SYSTEM</p>
            <p className="text-[14px] font-bold text-white -mt-1">Profile Control Center</p>
          </div>
        </div>
        <button onClick={onClose} className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition shadow-xl">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* MAIN CONTENT - Split Layout */}
      <div onClick={e=>e.stopPropagation()} className="relative z-10 flex-1 flex flex-col lg:flex-row gap-6 p-6 md:p-8 max-w-[1200px] w-full mx-auto">

        {/* LEFT - Avatar System */}
        <div className="lg:w-[42%] flex flex-col">
          <div className="relative rounded-[32px] overflow-hidden bg-white/[0.06] backdrop-blur-2xl border border-white/10 p-1 shadow-2xl">
            <div className="rounded-[28px] overflow-hidden bg-black/50 relative aspect-[4/5]">
              {currentUser.avatar_url? <img src={currentUser.avatar_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white">{currentUser.full_name.slice(0,2)}</div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

              {/* Floating Badge */}
              <div className="absolute top-4 left-4 right-4 flex justify-between">
                <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE ANOINTED
                </div>
                {isApostle && <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center"><Crown className="w-4 h-4 text-black" /></div>}
              </div>

              {/* Name Over Image */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                {editing? (
                  <div className="flex gap-2">
                    <input value={name} onChange={e=>setName(e.target.value)} className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5 text-white outline-none" autoFocus />
                    <button onClick={saveName} className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center"><Check className="w-5 h-5" /></button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-end gap-3">
                      <h1 className="text-[32px] font-black text-white leading-[0.9] tracking-tight">{currentUser.full_name}</h1>
                      <button onClick={()=>setEditing(true)} className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center