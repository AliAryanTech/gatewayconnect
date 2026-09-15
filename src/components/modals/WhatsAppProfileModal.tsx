import React, { useState } from 'react';
import { X, Camera, Edit3, Check, Copy, LogOut, Crown } from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storageService';
import { ImagePickerModal } from './ImagePickerModal';

export const WhatsAppProfileModal = ({ isOpen, onClose, currentUser, onUpdateUser, onLogout }: any) => {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(currentUser.full_name);
  const [picker, setPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const saveName = () => {
    const u = StorageService.updateUserProfile({ full_name: name });
    onUpdateUser(u);
    setEdit(false);
  };
  const savePhoto = (url: string) => {
    const u = StorageService.updateUserProfile({ avatar_url: url });
    onUpdateUser(u);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black" onClick={onClose}>
      <div className="absolute inset-0">
        <img src={currentUser.avatar_url} className="w-full h-full object-cover opacity-30" alt="" />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[24px]" />
      </div>
      <div className="relative z-10 h-full flex flex-col p-4 max-w-[900px] mx-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <p className="text-[10px] tracking-widest font-black text-white/40">COVENANT OS</p>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 mt-6 grid md:grid-cols-2 gap-4">
          <div className="rounded-[24px] bg-white/5 border border-white/10 p-2">
            <div className="rounded-[20px] overflow-hidden aspect-[4/5] relative bg-zinc-900">
              <img src={currentUser.avatar_url} className="w-full h-full object-cover" alt="" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                {edit? (
                  <div className="flex gap-2"><input value={name} onChange={e=>setName(e.target.value)} className="flex-1 bg-white/10 rounded-full px-3 py-2 text-white text-sm outline-none" /><button onClick={saveName} className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center"><Check className="w-4 h-4" /></button></div>
                ) : (
                  <div className="flex items-center gap-2"><h1 className="text-[22px] font-black text-white">{currentUser.full_name}</h1><button onClick={()=>setEdit(true)} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><Edit3 className="w-3 h-3 text-white" /></button></div>
                )}
              </div>
            </div>
            <button onClick={()=>setPicker(true)} className="mt-2 w-full h-11 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center gap-2"><Camera className="w-4 h-4" /> CHANGE PHOTO</button>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-[20px] bg-white/5 border border-white/10 p-4">
              <p className="text-[10px] font-bold text-white/30">MEMBER ID</p>
              <div className="flex justify-between items-center mt-1"><p className="text-sm font-mono font-bold text-white">{currentUser.member_id}</p><button onClick={async()=>{await navigator.clipboard.writeText(currentUser.member_id); setCopied(true); setTimeout(()=>setCopied(false),1000)}} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">{copied? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/60" />}</button></div>
            </div>
            <div className="rounded-[20px] bg-white/5 border border-white/10 p-4"><p className="text-[10px] font-bold text-white/30">PHONE</p><p className="text-sm font-bold text-white mt-1">{currentUser.phone}</p></div>
            <div className="rounded-[20px] bg-white/5 border border-white/10 p-4"><p className="text-[10px] font-bold text-white/30">ROLE</p><p className="text-sm font-bold text-white mt-1 flex items-center gap-2"><Crown className="w-4 h-4 text-amber-400" />{currentUser.role}</p></div>
            <button onClick={onLogout} className="mt-auto h-12 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold text-xs flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> LOGOUT</button>
          </div>
        </div>
      </div>
      <ImagePickerModal isOpen={picker} onClose={()=>setPicker(false)} onSelectImage={savePhoto} currentImage={currentUser.avatar_url} title="Update" subtitle="Choose" />
    </div>
  );
};