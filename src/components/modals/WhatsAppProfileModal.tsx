import React, { useEffect, useState } from 'react';
import { X, Camera, User as UserIcon, Phone, Info, Edit3, Check, Copy, LogOut, ShieldCheck, Sparkles, ArrowLeft, KeyRound } from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storageService';
import { ImagePickerModal } from './ImagePickerModal';
import confetti from 'canvas-confetti';

interface WhatsAppProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onOpenSwitchRole?: () => void;
}

export const WhatsAppProfileModal: React.FC<WhatsAppProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser.full_name);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutInput, setAboutInput] = useState(currentUser.role === 'super_admin'
    ? 'Apostle of Jesus Christ • Preaching the Kingdom with power & speed'
    : 'Available in Christ • Praying without ceasing 🙏');
  const [copiedId, setCopiedId] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setNameInput(currentUser.full_name);
  }, [isOpen, currentUser.full_name]);

  if (!isOpen) return null;

  const initials = currentUser.full_name.split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'GC';
  const roleLabel = currentUser.role === 'super_admin' ? 'Apostle / Super Admin' : currentUser.role.replace('_', ' ');

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    const updated = StorageService.updateUserProfile({ full_name: nameInput.trim() });
    onUpdateUser(updated);
    setIsEditingName(false);
  };

  const handleSaveAbout = () => {
    // Keep the about text local until a dedicated profile-bio field is available in the schema.
    setIsEditingAbout(false);
  };

  const handleSavePhoto = (newAvatarUrl: string) => {
    const updated = StorageService.updateUserProfile({ avatar_url: newAvatarUrl });
    onUpdateUser(updated);
    setShowPhotoPicker(false);
    confetti({ particleCount: 25, spread: 60, origin: { y: 0.5 } });
  };

  const handleCopyMemberId = async () => {
    try { await navigator.clipboard.writeText(currentUser.member_id); } catch {}
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="w-full sm:max-w-md h-full sm:h-auto sm:max-h-[88vh] overflow-hidden bg-[#071018] text-white sm:rounded-[30px] border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Premium profile header */}
        <div className="relative overflow-hidden px-4 pt-4 pb-6 bg-gradient-to-br from-[#101d2b] via-[#0b151f] to-[#071018]">
          <div className="absolute -top-24 -right-20 w-56 h-56 rounded-full bg-[#00a884]/10 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/75" aria-label="Close profile"><ArrowLeft className="w-5 h-5" /></button>
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-[0.24em] text-[#00a884] font-bold">Gateway Connect</p>
              <h2 className="text-sm font-bold mt-0.5">My profile</h2>
            </div>
            <button onClick={() => setShowLogoutConfirm(true)} className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400" aria-label="Log out"><LogOut className="w-4 h-4" /></button>
          </div>

          <div className="relative flex flex-col items-center mt-6">
            <button type="button" onClick={() => setShowPhotoPicker(true)} className="relative group rounded-full" aria-label="Change profile photo">
              <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-[#00a884] via-[#d4af37] to-[#334155] shadow-[0_0_35px_rgba(0,168,132,.18)]">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#17232c] border-4 border-[#071018] flex items-center justify-center">
                  {currentUser.avatar_url ? <img src={currentUser.avatar_url} alt={currentUser.full_name} className="w-full h-full object-cover" /> : <span className="text-3xl font-black text-[#aebac1]">{initials}</span>}
                </div>
              </div>
              <span className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#00a884] border-4 border-[#071018] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"><Camera className="w-4 h-4" /></span>
            </button>
            <h3 className="mt-3 text-lg font-black tracking-tight">{currentUser.full_name}</h3>
            <p className="text-[11px] text-white/45 mt-0.5">{currentUser.handle || `@${currentUser.full_name.toLowerCase().replace(/\s+/g, '_')}`}</p>
            <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-[#00a884]/10 border border-[#00a884]/20 text-[#63d9bb] text-[9px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" /> {roleLabel}
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-4 pb-5 overflow-y-auto max-h-[calc(100vh-290px)] sm:max-h-[58vh] space-y-2.5 bg-[#071018]">
          {/* Identity */}
          <section className="rounded-2xl bg-[#101b24] border border-white/7 overflow-hidden">
            <div className="px-3.5 py-2.5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#00a884] border-b border-white/5"><UserIcon className="w-3.5 h-3.5" /> Identity</div>
            <div className="p-3.5">
              <div className="flex items-start gap-3">
                <UserIcon className="w-4 h-4 text-white/35 mt-1" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-white/40 block">Display name</span>
                  {isEditingName ? (
                    <div className="flex gap-2 mt-1">
                      <input autoFocus value={nameInput} onChange={e => setNameInput(e.target.value)} className="flex-1 bg-[#071018] border border-[#00a884]/60 rounded-lg px-2.5 py-2 text-xs outline-none" />
                      <button onClick={handleSaveName} className="p-2 rounded-lg bg-[#00a884] text-white"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { setNameInput(currentUser.full_name); setIsEditingName(false); }} className="p-2 rounded-lg bg-white/5 text-white/60"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold truncate">{currentUser.full_name}</span><button onClick={() => setIsEditingName(true)} className="p-1.5 text-white/40 hover:text-[#00a884]"><Edit3 className="w-3.5 h-3.5" /></button></div>
                  )}
                </div>
              </div>
              <p className="text-[9px] text-white/30 mt-2 pl-7">This name is visible to your Gateway contacts.</p>
            </div>
          </section>

          {/* About */}
          <section className="rounded-2xl bg-[#101b24] border border-white/7 p-3.5">
            <div className="flex items-start gap-3"><Info className="w-4 h-4 text-white/35 mt-1" /><div className="flex-1 min-w-0"><span className="text-[10px] text-white/40 block">About</span>{isEditingAbout ? <div className="flex gap-2 mt-1"><input autoFocus value={aboutInput} onChange={e => setAboutInput(e.target.value)} className="flex-1 bg-[#071018] border border-[#00a884]/60 rounded-lg px-2.5 py-2 text-xs outline-none" /><button onClick={handleSaveAbout} className="p-2 rounded-lg bg-[#00a884] text-white"><Check className="w-3.5 h-3.5" /></button></div> : <div className="flex items-center justify-between gap-2"><span className="text-xs text-white/75 leading-relaxed">{aboutInput}</span><button onClick={() => setIsEditingAbout(true)} className="p-1.5 text-white/40 hover:text-[#00a884]"><Edit3 className="w-3.5 h-3.5" /></button></div>}</div></div>
          </section>

          {/* Contact */}
          <section className="rounded-2xl bg-[#101b24] border border-white/7 divide-y divide-white/5">
            <div className="p-3.5 flex items-center gap-3"><Phone className="w-4 h-4 text-white/35" /><div><span className="text-[10px] text-white/40 block">Phone</span><span className="text-xs font-semibold font-mono">{currentUser.phone}</span></div></div>
            <div className="p-3.5 flex items-center gap-3"><KeyRound className="w-4 h-4 text-white/35" /><div className="flex-1 min-w-0"><span className="text-[10px] text-white/40 block">Member ID</span><span className="text-xs font-semibold font-mono">{currentUser.member_id}</span></div><button onClick={handleCopyMemberId} className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/7 text-[9px] font-bold text-white/65 flex items-center gap-1">{copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}{copiedId ? 'Copied' : 'Copy'}</button></div>
          </section>

          <button onClick={() => setShowPhotoPicker(true)} className="w-full py-3 rounded-2xl bg-[#101b24] hover:bg-[#14232e] border border-white/7 text-xs font-bold flex items-center justify-center gap-2"><Camera className="w-4 h-4 text-[#00a884]" /> Change profile photo</button>
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> Log out</button>
          <div className="flex items-center justify-center gap-1.5 pt-1 text-[9px] text-white/25"><Sparkles className="w-3 h-3" /> Gateway premium profile</div>
        </div>

        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowLogoutConfirm(false)}>
            <div className="bg-[#101b24] border border-white/10 rounded-2xl max-w-xs w-full p-5 text-center space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="w-11 h-11 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center mx-auto"><LogOut className="w-5 h-5" /></div>
              <div><h4 className="font-bold text-sm">Log out?</h4><p className="text-[10px] text-white/45 mt-1">You can sign in again with your phone number.</p></div>
              <div className="flex gap-2"><button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 text-xs font-bold">Cancel</button><button onClick={() => { setShowLogoutConfirm(false); onLogout(); onClose(); }} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold">Log out</button></div>
            </div>
          </div>
        )}

        <ImagePickerModal isOpen={showPhotoPicker} onClose={() => setShowPhotoPicker(false)} onSelectImage={handleSavePhoto} currentImage={currentUser.avatar_url} title="Update profile photo" subtitle="Choose a photo from your device or the Gateway gallery." />
      </div>
    </div>
  );
};
