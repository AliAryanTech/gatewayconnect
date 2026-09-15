import React, { useState, useEffect } from 'react';
import { X, Camera, Edit3, Check, Copy, LogOut, Shield, Phone } from 'lucide-react';
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
      <style>{`
        @keyframes modal-enter {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes border-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes text-shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .anim-modal { animation: modal-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .anim-border { animation: border-glow 3s ease-in-out infinite; }
        
        .text-gradient-credit {
          background: linear-gradient(90deg, #f472b6, #c084fc, #22d3ee, #c084fc, #f472b6);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: text-shine 4s linear infinite;
        }
      `}</style>

      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Compact Modal Container */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="relative w-full max-w-[380px] rounded-[2rem] bg-[#09090b] border border-white/10 shadow-2xl shadow-purple-900/30 overflow-hidden anim-modal"
        >
          {/* Glowing Border Effect (Top) */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent anim-border" />

          {/* Header / Avatar Section */}
          <div className="relative pt-8 pb-6 flex flex-col items-center">
            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all active:scale-90"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>

            {/* Avatar */}
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-cyan-500 rounded-full blur-md opacity-40" />
              <div className="relative w-24 h-24 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500">
                <img 
                  src={currentUser.avatar_url} 
                  className="w-full h-full rounded-full object-cover border-[3px] border-[#09090b]" 
                  alt="Profile" 
                />
              </div>
              <button 
                onClick={() => setIsPickerOpen(true)}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-zinc-800 border-2 border-[#09090b] flex items-center justify-center hover:bg-zinc-700 transition-colors active:scale-90 shadow-lg"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            {/* Name & Role */}
            <div className="text-center px-6 w-full">
              {isEditing ? (
                <div className="flex gap-2 justify-center items-center">
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && saveName()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white text-sm text-center outline-none focus:border-purple-500 transition-colors" 
                    autoFocus
                  />
                  <button 
                    onClick={saveName} 
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white">{currentUser.full_name}</h1>
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors active:scale-90"
                    >
                      <Edit3 className="w-3 h-3 text-white/60" />
                    </button>
                  </div>
                  <p className="text-[10px] text-purple-400 font-semibold tracking-[0.2em] uppercase">{currentUser.role}</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="px-5 space-y-3">
            {/* Member ID */}
            <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl p-3.5 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-[9px] text-white/30 font-bold tracking-wider uppercase">Member ID</p>
                  <p className="text-sm font-mono text-white/90 mt-0.5">{currentUser.member_id}</p>
                </div>
              </div>
              <button 
                onClick={handleCopyId} 
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-white/40" />}
              </button>
            </div>

            {/* Phone */}
            <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl p-3.5 flex items-center gap-3 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Phone className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-[9px] text-white/30 font-bold tracking-wider uppercase">Phone Number</p>
                <p className="text-sm text-white/90 mt-0.5">{currentUser.phone}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={onLogout} 
              className="w-full h-11 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2"
            >
              <LogOut className="w-3.5 h-3.5" /> 
              LOGOUT
            </button>
          </div>

          {/* ✨ STYLISH & VISIBLE CREDIT SECTION ✨ */}
          <div className="mt-6 pt-4 pb-5 border-t border-white/5 flex flex-col items-center gap-1.5">
            <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-medium">
              Premium UI
            </p>
            <p className="text-lg font-black italic tracking-wide text-gradient-credit drop-shadow-[0_0_8px_rgba(192,132,252,0.3)]">
              Design by AsifOfc
            </p>
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
