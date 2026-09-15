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
      {/* Custom Animations Style Block */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(168, 85, 247, 0.1); }
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.6), inset 0 0 30px rgba(168, 85, 247, 0.2); }
        }
        .animate-float-slow { animation: float-slow 15s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
      `}</style>

      {/* Backdrop with Floating Orbs */}
      <div 
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden"
        onClick={onClose}
      >
        {/* Animated Background Blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '-10s' }} />

        {/* Main Modal Container */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="relative w-full max-w-md rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-purple-900/20 overflow-hidden animate-fade-in-up"
        >
          {/* Top Glow Effect */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-500/20 to-transparent pointer-events-none" />

          <div className="relative p-6 pt-8 flex flex-col items-center">
            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all duration-300 hover:rotate-90"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-white/80" />
            </button>

            {/* Animated Avatar Section */}
            <div className="relative mb-6 animate-fade-in-up delay-100">
              {/* Rotating Neon Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-cyan-500 p-[3px] animate-spin-slow">
                <div className="w-full h-full rounded-full bg-zinc-900" />
              </div>
              
              {/* Avatar Image */}
              <div className="relative w-28 h-28 rounded-full p-1 animate-pulse-glow">
                <img 
                  src={currentUser.avatar_url} 
                  className="w-full h-full rounded-full object-cover border-2 border-zinc-900" 
                  alt="Profile" 
                />
                {/* Camera Overlay */}
                <button 
                  onClick={() => setIsPickerOpen(true)}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-600 border-2 border-zinc-900 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Name & Role Section */}
            <div className="w-full text-center mb-6 animate-fade-in-up delay-200">
              {isEditing ? (
                <div className="flex gap-2 justify-center">
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && saveName()}
                    className="flex-1 max-w-[200px] bg-black/40 border border-white/20 rounded-full px-4 py-2 text-white text-sm outline-none focus:border-purple-500 transition-colors" 
                    autoFocus
                  />
                  <button 
                    onClick={saveName} 
                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-white tracking-tight">{currentUser.full_name}</h1>
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <Edit3 className="w-3 h-3 text-white/70" />
                    </button>
                  </div>
                  <p className="text-xs text-purple-300/80 font-medium tracking-wider uppercase">{currentUser.role}</p>
                </div>
              )}
            </div>

            {/* Info Cards Grid */}
            <div className="w-full grid grid-cols-1 gap-3 mb-6 animate-fade-in-up delay-300">
              {/* Member ID Card */}
              <div className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <Shield className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 font-bold tracking-wider">MEMBER ID</p>
                      <p className="text-sm font-mono text-white mt-0.5">{currentUser.member_id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleCopyId} 
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/50" />}
                  </button>
                </div>
              </div>

              {/* Phone Card */}
              <div className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                    <Phone className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 font-bold tracking-wider">PHONE NUMBER</p>
                    <p className="text-sm text-white mt-0.5">{currentUser.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="w-full animate-fade-in-up delay-400">
              <button 
                onClick={onLogout} 
                className="w-full h-12 rounded-2xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-white/70 hover:text-red-400 text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" /> 
                LOGOUT
              </button>
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
