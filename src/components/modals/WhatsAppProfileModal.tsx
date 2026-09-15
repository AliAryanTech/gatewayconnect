import React, { useState } from 'react';
import { X, Camera, Edit3, Check, Copy, LogOut, Crown, Sparkles } from 'lucide-react';
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
    setIsEditing(false);
  };
  const setIsEditing = (v: boolean) => setEditing(v);

  const savePhoto = (url: string) => {
    const u = StorageService.updateUserProfile({ avatar_url: url });
    onUpdateUser(u);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="relative w-full max-w-[340px] rounded-[28px] bg-[#101014] border border-white/10 shadow-[0_20px_60px_-15px_rgba(124,58,237,0.6)] overflow-hidden animate-[float_6s_ease-in-out_infinite]">

        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-[180px] h-[180px] bg-violet-600/30 blur-[40px] rounded-full animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-[180px] h-[180px] bg-fuchsia-600/20 blur-[40px] rounded-full animate-pulse" />

        {/* Top Bar */}
        <div className="relative p-4 flex justify-between items-center">
          <div className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[9px] font-black tracking-widest text-white/70 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> ELITE
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Avatar */}
        <div className="relative flex flex-col items-center -mt-2 pb-5">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-[12px] opacity-60 animate-pulse" />
            <div className="relative w-[92px] h-[92px] rounded-full p-[2px] bg-gradient-to-br from-white to-white/20">
              <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900">
                {currentUser.avatar_url? <img src={currentUser.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-white">{currentUser.full_name.slice(0,2)}</div>}
              </div>
            </div>
            <button onClick={()=>setShowPicker(true)} className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-lg border-2 border-[#101014] hover:rotate-12 transition-transform">
              <Camera className="w-3.5 h-3.5" />
            </button>
            {currentUser.role === 'super_admin' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow">
                <Crown className="w-3.5 h-3.5 text-black" />
              </div>
            )}
          </div>

          {editing? (
            <div className="flex gap-2 mt-4 px-6 w-full">
              <input value={name} onChange={e=>setName(e.target.value)} className="flex-1 bg-white/10 border border-violet-500/50 rounded-full px-4 py-2 text-sm text-white outline-none text-center" autoFocus />
              <button onClick={saveName} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center"><Check className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-[18px] font-black text-white tracking-tight">{currentUser.full_name}</h2>
                <button onClick={()=>setEditing(true)} className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center"><Edit3 className="w-3 h-3 text-white/60" /></button>
              </div>
              <p className="text-[11px] text-white/50 mt-1 px-6 leading-snug">
                {currentUser.role === 'super_admin'? 'Apostle • Preaching with power' : 'Available in Christ • Praying 🙏'}
              </p>
            </div>
          )}

          {/* Mini Stats - Floating Pills */}
          <div className="flex gap-2 mt-4">
            <div className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-mono text-white/70 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> {currentUser.phone.slice(-4)}
            </div>
            <button onClick={async ()=>{ await navigator.clipboard.writeText(currentUser.member_id); setCopied(true); setTimeout(()=>setCopied(false),1200); }} className="px-3 py-1.5 rounded-full bg-violet-600/20 border border-violet-500/30 text-[11px] font-mono text-violet-200 flex items-center gap-1">
              {copied? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied? 'Copied' : currentUser.member_id.slice(0,6)}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-3 grid grid-cols-2 gap-2.5 bg-white/[0.02] border-t border-white/5">
          <button onClick={()=>setShowPicker(true)} className="h-11 rounded-full bg-white text-black font-bold text-[12px] flex items-center justify-center gap-1.5 hover:bg-zinc-100 transition">
            <Camera className="w-4 h-4" /> Photo
          </button>
          <button onClick={()=>setShowLogout(true)} className="h-11 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold text-[12px] flex items-center justify-center gap-1.5 hover:bg-red-500/10 hover:text-red-400">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {showLogout && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-5">
            <div className="bg-[#1A1A1F] border border-white/10 rounded-[18px] p-4 w-full text-center">
              <p className="font-bold text-white text-sm">Log out?</p>
              <div className="flex gap-2 mt-4">
                <button onClick={()=>setShowLogout(false)} className="flex-1 h-10 rounded-full bg-white/10 text-white text-xs font-bold">Cancel</button>
                <button onClick={()=>{ setShowLogout(false); onLogout(); onClose(); }} className="flex-1 h-10 rounded-full bg-red-600 text-white text-xs font-bold">Logout</button>
              </div>
            </div>
          </div>
        )}

        <ImagePickerModal isOpen={showPicker} onClose={()=>setShowPicker(false)} onSelectImage={savePhoto} currentImage={currentUser.avatar_url} title="Update photo" subtitle="Choose photo" />

        <style>{`@keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }`}</style>
      </div>
    </div>
  );
};