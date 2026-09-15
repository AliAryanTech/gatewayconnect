import React, { useState } from 'react';
import { X, Camera, Edit3, Check, Copy, LogOut, Shield, Crown, Phone, Hash, Sparkles, Settings2 } from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storageService';
import { ImagePickerModal } from './ImagePickerModal';
import confetti from 'canvas-confetti';

export const WhatsAppProfileModal: React.FC<any> = ({ isOpen, onClose, currentUser, onUpdateUser, onLogout }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser.full_name);
  const [showPicker, setShowPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const saveName = () => {
    const u = StorageService.updateUserProfile({ full_name: name.trim() });
    onUpdateUser(u);
    setEditing(false);
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
  };

  const savePhoto = (url: string) => {
    const u = StorageService.updateUserProfile({ avatar_url: url });
    onUpdateUser(u);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      {/* Drawer */}
      <div onClick={e=>e.stopPropagation()} className="w-full max-w-[420px] h-full bg-[#0e0e10] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300">

        {/* COVER */}
        <div className="relative h-[42%] shrink-0">
          <img src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?q=80'} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10] via-[#0e0e10]/70 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/40 to-fuchsia-600/30 mix-blend-overlay" />

          {/* Top Bar */}
          <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center">
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white"><X className="w-5 h-5" /></button>
            <div className="flex gap-2">
              <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-widest text-white flex items-center gap-1.5"><Crown className="w-3 h-3 text-amber-400" /> {currentUser.role === 'super_admin'? 'APOSTLE' : 'ELITE MEMBER