import React, { useState } from 'react';
import { X, Camera, Edit3, Check, Copy, LogOut } from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storageService';
import { ImagePickerModal } from './ImagePickerModal';

export const WhatsAppProfileModal = (props: any) => {
  const { isOpen, onClose, currentUser, onUpdateUser, onLogout } = props;
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="w-full max-w-[720px] rounded-3xl bg-zinc-900 border border-white/10 overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 relative p-6 bg-gradient-to-br from-violet-600 to-fuchsia-600">
          <img src={currentUser.avatar_url} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative h-full flex flex-col justify-end">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20">
              <img src={currentUser.avatar_url} className="w-full h-full object-cover" alt="" />
            </div>
            {edit? (
              <div className="flex gap-2 mt-4">
                <input value={name} onChange={e=>setName(e.target.value)} className="flex-1 bg-black/50 rounded-full px-3 py-2 text-white text-sm outline-none" />
                <button onClick={saveName} className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center"><Check className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="mt-4">
                <h1 className="text-xl font-black text-white flex gap-2 items-center">{currentUser.full_name}<button onClick={()=>setEdit(true)} className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"><Edit3 className="w-3 h-3" /></button></h1>
                <p className="text-xs text-white/70 mt-1">{currentUser.role}</p>
              </div>
            )}
            <button onClick={()=>setPicker(true)} className="mt-4 h-10 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center gap-2"><Camera className="w-4 h-4" />EDIT PHOTO</button>
          </div>
        </div>
        <div className="md:w-1/2 p-6 flex flex-col gap-3 bg-zinc-900">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-white/40">VAULT</p>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><X className="w-4 h-4 text-white" /></button>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex justify-between">
            <div><p className="text-[10px] text-white/40">MEMBER ID</p><p className="text-sm font-mono text-white mt-1">{currentUser.member_id}</p></div>
            <button onClick={async()=>{await navigator.clipboard.writeText(currentUser.member_id); setCopied(true); setTimeout(()=>setCopied(false),1000)}} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">{copied?<Check className="w-4 h-4 text-green-400" />:<Copy className="w-4 h-4 text-white/60" />}</button>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4"><p className="text-[10px] text-white/40">PHONE</p><p className="text-sm text-white mt-1">{currentUser.phone}</p></div>
          <button onClick={onLogout} className="mt-auto h-11 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-bold flex items-center justify-center gap-2"><LogOut className="w-4 h-4" />LOGOUT</button>
        </div>
      </div>
      <ImagePickerModal isOpen={picker} onClose={()=>setPicker(false)} onSelectImage={savePhoto} currentImage={currentUser.avatar_url} title="Update" subtitle="" />
    </div>
  );
};