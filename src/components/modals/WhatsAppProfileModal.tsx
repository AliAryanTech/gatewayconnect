import React, { useState } from 'react';
import { X, Camera, Edit3, Check, Copy, LogOut, Crown, Sparkles } from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storageService';
import { ImagePickerModal } from './ImagePickerModal';

export const WhatsAppProfileModal = ({ isOpen, onClose, currentUser, onUpdateUser, onLogout }: any) => {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(currentUser.full_name);
  const [picker, setPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#050508]/80 backdrop-blur-xl" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="w-full max-w-[760px] rounded-[32px] overflow-hidden bg-[#0F0F12] border border-white/[0.08] shadow-[0_0_100px_-20px_rgba(139,92,246,0.5)] flex flex-col md:flex-row">

        {/* LEFT PREMIUM COVER */}
        <div className="md:w-[44%] relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 p-[1px]">
          <div className="h-full bg-[#0F0F12] rounded-[31px] md:rounded-none md:rounded-l-[31px] overflow-hidden relative flex flex-col">
            <img src={currentUser.avatar_url} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-[#0F0F12]/60 to-transparent" />
            <div className="relative p-6 flex-1 flex flex-col justify-end">
              <div className="w-20 h-20 rounded-[20px] overflow-hidden border-2 border-white/20 shadow-xl">
                <img src={currentUser.avatar_url} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="mt-4">
                {edit? (
                  <div className="flex gap-2">
                    <input value={name} onChange={e=>setName(e.target.value)} className="flex-1 bg-white/10 border border-violet-500 rounded-full px-3 py-2 text-sm text-white outline-none" autoFocus />
                    <button onClick={()=>{ const u=StorageService.updateUserProfile({full_name:name}); onUpdateUser(u); setEdit(false); }} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center"><Check className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-[24px] font-black text-white leading-none flex items-center gap-2">{currentUser.full_name}<button onClick={()=>setEdit(true)} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><Edit3 className="w-3 h-3" /></button></h1>
                    <p className="text-[11px] text-white/60 mt-2 flex items-center gap-1"><Sparkles className="w-3 h-3 text-violet-300" />{currentUser.role==='super_admin'?'APOSTLE • SUPER ADMIN':'ELITE COVENANT MEMBER'}</p>
                  </div>
                )}
              </div>
              <button onClick={()=>setPicker(true)} className="mt-4 h-10 rounded-full bg-white text-black text-[11px] font-black tracking-widest flex items-center justify-center gap-2"><Camera className="w-4 h-4" /> EDIT PHOTO</button>
            </div>
          </div>
        </div>

        {/* RIGHT SYSTEM */}
        <div className="md:w-[56%] p-6 flex flex-col gap-4 bg-[#0F0F12]">
          <div className="flex justify-between items-center">
            <div className="px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/20 text-[10px] font-bold text-violet-300 flex items-center gap-1"><Crown className="w-3 h-3" />PREMIUM VAULT</div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60"><X className="w-4 h-4" /></button>
          </div>

          <div className="rounded-[16px] bg-white/[0.04] border border-white/5 p-4 flex justify-between items-center">
            <div><p className="text-[9px] tracking-widest font-bold text-white/30">MEMBER ID</p><p className="text-[13px] font-mono font-bold text-white mt-1">{currentUser.member_id}</p></div>
            <button onClick={async()=>{await navigator.clipboard.writeText(currentUser.member_id); setCopied(true); setTimeout(()=>setCopied(false),1000)}} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">{copied?<Check className="w-4 h-4 text-emerald-400" />:<Copy className="w-4 h-4 text-white/50" />}</button>
          </div>

          <div className="rounded-[16px] bg-white/[0.04] border border-white/5 p-4">
            <p className="text-[9px] tracking-widest font-bold text-white/30">PHONE</p><p className="text-[13px] font-bold text-white mt-1">{currentUser.phone}</p>
          </div>

          <div className="rounded-[16px] bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 border border-violet-500/20 p-4">
            <p className="text-[9px] tracking-widest font-bold text-violet-300">DECLARATION</p><p className="text-[12px] text-white/70 italic mt-2">Walking in dominion, available in Christ.</p>
          </div>

          <button onClick={()=>{onLogout(); onClose();}} className="mt-auto h-11 rounded-full bg-white/[0.06] border border-white/10 text-white/60 text-