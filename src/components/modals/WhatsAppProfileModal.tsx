import React, { useState, useEffect } from 'react';
import { X, Camera, Edit3, Check, Copy, LogOut, Shield, Phone, Sparkles } from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storageService';
import { ImagePickerModal } from './ImagePickerModal';

interface WhatsAppProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

export const WhatsAppProfileModal: React.FC<WhatsAppProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.full_name);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setName(currentUser.full_name);
  }, [currentUser.full_name]);

  if (!isOpen) return null;

  const saveName = () => {
    if (!name.trim()) return;
    const updatedUser = StorageService.updateUserProfile({ full_name: name.trim() });
    onUpdateUser(updatedUser);
    setIsEditing(false);
  };

  const savePhoto = (url: string) => {
    const updatedUser = StorageService.updateUserProfile({ avatar_url: url });
    onUpdateUser(updatedUser);
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(currentUser.member_id);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <>
      {/* Custom Animations for Full Screen */}
      <style>{`
        @keyframes bg-fade-in {
          from { opacity: 0; transform: scale(1.1); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-up-smooth {
          from { opacity: 0; transform: translateY(100px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .anim-bg-fade { animation: bg-fade-in 1s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .anim-slide-up { animation: slide-up-smooth 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; opacity: 0; }
        .anim-fade-down { animation: fade-in-down 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; opacity: 0; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        
        .text-shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.3) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      {/* FULL SCREEN CONTAINER */}
      <div className="fixed inset-0 z-50 bg-black overflow-hidden">
        
        {/* 1. Massive Blurred Background Image */}
        <div className="absolute inset-0 anim-bg-fade">
          <img 
            src={currentUser.avatar_url} 
            className="w-full h-full object-cover scale-110 blur-3xl opacity-40" 
            alt="" 
          />
          {/* Dark Gradient Overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        </div>

        {/* 2. Top Navigation Bar */}
        <div className="relative z-10 flex justify-between items-center p-5 anim-fade-down">
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <p className="text-sm font-semibold text-white/80 tracking-wide">PROFILE</p>
          
          <div className="w-10 h-10" /> {/* Spacer for centering */}
        </div>

        {/* 3. Main Content Area (Scrollable if needed) */}
        <div className="relative z-10 h-full flex flex-col items-center justify-between px-6 pb-8 pt-4 overflow-y-auto">
          
          {/* Top Section: Avatar & Name */}
          <div className="flex flex-col items-center w-full anim-slide-up delay-100">
            {/* Avatar */}
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full p-[2px] bg-gradient-to-br from-white/40 to-white/5">
                <img 
                  src={currentUser.avatar_url} 
                  className="w-full h-full rounded-full object-cover border-4 border-black/50" 
                  alt="Profile" 
                />
              </div>
              {/* Camera Button */}
              <button 
                onClick={() => setIsPickerOpen(true)}
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all active:scale-90 shadow-lg"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Name & Role */}
            <div className="text-center w-full">
              {isEditing ? (
                <div className="flex gap-2 justify-center items-center">
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && saveName()}
                    className="w-64 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 text-white text-center text-lg outline-none focus:border-white/50 transition-colors" 
                    autoFocus
                  />
                  <button 
                    onClick={saveName} 
                    className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white tracking-tight">{currentUser.full_name}</h1>
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors active:scale-90"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-white/80" />
                    </button>
                  </div>
                  <p className="text-xs text-white/50 font-medium tracking-widest uppercase">{currentUser.role}</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Info Cards & Actions */}
          <div className="w-full max-w-md space-y-4 anim-slide-up delay-300">
            
            {/* Member ID */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/40 font-bold tracking-wider uppercase">Member ID</p>
                  <p className="text-base font-mono text-white mt-0.5">{currentUser.member_id}</p>
                </div>
              </div>
              <button 
                onClick={handleCopyId} 
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all active:scale-90"
              >
                {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/60" />}
              </button>
            </div>

            {/* Phone */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 font-bold tracking-wider uppercase">Phone Number</p>
                <p className="text-base text-white mt-0.5">{currentUser.phone}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={onLogout} 
              className="w-full h-14 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-6"
            >
              <LogOut className="w-4 h-4" /> 
              LOGOUT
            </button>

            {/* ✨ STYLISH WATERMARK: Design by AsifOfc ✨ */}
            <div className="pt-8 pb-2 flex flex-col items-center gap-1 anim-slide-up delay-400">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-white/20" />
                <p className="text-[10px] tracking-[0.4em] uppercase text-white/30 font-light">
                  Designed by 
                </p>
                <Sparkles className="w-3 h-3 text-white/20" />
              </div>
              <p className="text-xl font-extralight tracking-widest text-shimmer italic">
                AsifOfc
              </p>
            </div>

          </div>
        </div>
      </div>
      
      <ImagePickerModal 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        onSelectImage={savePhoto} 
        currentImage={currentUser.avatar_url} 
        title="Update Avatar" 
        subtitle="Choose a new profile picture" 
      />
    </>
  );
};
