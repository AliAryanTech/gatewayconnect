import React, { useState } from 'react';
import {
  X,
  Camera,
  Edit3,
  Check,
  Copy,
  LogOut,
  ShieldCheck,
  ArrowLeft,
  Quote
} from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storageService';
import { ImagePickerModal } from './ImagePickerModal';
import { VerifiedBadge } from '../common/VerifiedBadge';
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
  onLogout,
  onOpenSwitchRole
}) => {
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(currentUser.full_name);
  const [isEditingAbout, setIsEditingAbout] = useState<boolean>(false);
  const [aboutInput, setAboutInput] = useState<string>(
    currentUser.role === 'super_admin'
      ? 'Apostle of Jesus Christ • Preaching the Kingdom with power & speed'
      : 'Available in Christ • Praying without ceasing 🙏'
  );
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    const updated = StorageService.updateUserProfile({ full_name: nameInput.trim() });
    onUpdateUser(updated);
    setIsEditingName(false);
  };

  const handleSavePhoto = (newAvatarUrl: string) => {
    const updated = StorageService.updateUserProfile({ avatar_url: newAvatarUrl });
    onUpdateUser(updated);
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.5 }
    });
  };

  const handleCopyMemberId = () => {
    navigator.clipboard.writeText(currentUser.member_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const badgeType = currentUser.verified_badge || currentUser.badge_type || (currentUser.is_verified ? 'gold' : 'none');
  const displayRole = currentUser.role === 'super_admin' ? 'Apostle / Super Admin' : currentUser.role.replace(/_/g, ' ');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card text-foreground border border-border rounded-[28px] max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[88vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="px-4 pt-4 pb-1 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold text-muted-foreground">Your profile</span>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 sm:px-6 pb-5 pt-3 space-y-5 overflow-y-auto flex-1">

          {/* Covenant Membership Card */}
          <div
            className="relative rounded-3xl border border-primary/30 overflow-hidden"
            style={{
              background:
                'linear-gradient(155deg, color-mix(in srgb, var(--primary) 14%, var(--card)) 0%, var(--card) 55%)'
            }}
          >
            <div className="absolute top-3.5 right-3.5 text-primary/60">
              <ShieldCheck className="w-4 h-4" />
            </div>

            <div className="p-4 sm:p-5 flex items-center gap-4">
              <div
                className="relative shrink-0 group cursor-pointer"
                onClick={() => setShowPhotoPicker(true)}
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/50 bg-secondary flex items-center justify-center shadow-md group-hover:border-primary transition-colors">
                  {currentUser.avatar_url ? (
                    <img
                      src={currentUser.avatar_url}
                      alt={currentUser.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                      {currentUser.full_name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-card shadow">
                  <Camera className="w-3 h-3" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="flex-1 bg-background border border-primary rounded-lg px-2 py-1 text-sm text-foreground focus:outline-none min-w-0"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-1.5 rounded-lg bg-primary text-primary-foreground shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setNameInput(currentUser.full_name);
                        setIsEditingName(false);
                      }}
                      className="p-1.5 rounded-lg bg-background text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-bold text-base text-foreground truncate">{currentUser.full_name}</h2>
                    {badgeType !== 'none' && <VerifiedBadge type={badgeType} size="sm" />}
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <span className="inline-block mt-1.5 text-[10px] font-semibold text-primary/90 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  {displayRole}
                </span>
              </div>
            </div>

            <div className="border-t border-primary/15 grid grid-cols-2 divide-x divide-primary/15">
              <div className="px-4 py-3 min-w-0">
                <span className="text-[10px] text-muted-foreground">Member ID</span>
                <button
                  onClick={handleCopyMemberId}
                  className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary transition-colors w-full"
                >
                  <span className="truncate">{copiedId ? 'Copied!' : currentUser.member_id}</span>
                  {copiedId ? (
                    <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                  ) : (
                    <Copy className="w-3 h-3 shrink-0 opacity-60" />
                  )}
                </button>
              </div>
              <div className="px-4 py-3 min-w-0">
                <span className="text-[10px] text-muted-foreground">Phone</span>
                <p className="mt-0.5 text-xs font-semibold text-foreground font-mono truncate">
                  {currentUser.phone}
                </p>
              </div>
            </div>
          </div>

          {/* About & Status */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-muted-foreground font-medium">About &amp; status</span>
            {isEditingAbout ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={aboutInput}
                  onChange={(e) => setAboutInput(e.target.value)}
                  className="flex-1 bg-secondary/60 border border-primary rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none min-w-0"
                  autoFocus
                />
                <button
                  onClick={() => setIsEditingAbout(false)}
                  className="p-2 rounded-xl bg-primary text-primary-foreground shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingAbout(true)}
                className="w-full text-left flex items-start gap-2.5 rounded-xl bg-secondary/40 hover:bg-secondary/60 border border-border px-3.5 py-3 transition-colors group"
              >
                <Quote className="w-3.5 h-3.5 text-primary/60 mt-0.5 shrink-0" />
                <span className="flex-1 text-sm text-foreground/85 italic leading-snug">{aboutInput}</span>
                <Edit3 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors mt-0.5 shrink-0" />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => setShowPhotoPicker(true)}
              className="py-3 rounded-2xl bg-secondary/60 hover:bg-secondary text-foreground text-xs font-bold flex items-center justify-center gap-1.5 border border-border transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-primary" />
              <span>Change photo</span>
            </button>
            <button
              id="btn-whatsapp-logout"
              onClick={() => setShowLogoutConfirm(true)}
              className="py-3 rounded-2xl bg-transparent hover:bg-destructive/10 text-destructive text-xs font-bold flex items-center justify-center gap-1.5 border border-destructive/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>

        </div>

        {/* Log Out Confirmation Dialog */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl max-w-xs w-full p-5 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/15 text-destructive flex items-center justify-center mx-auto">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-base">Log out?</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  You can log back in anytime with your phone number.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-transparent text-muted-foreground hover:text-foreground text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-destructive hover:brightness-110 text-destructive-foreground text-xs font-bold shadow"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Picker Modal for Profile Photo */}
        <ImagePickerModal
          isOpen={showPhotoPicker}
          onClose={() => setShowPhotoPicker(false)}
          onSelectImage={handleSavePhoto}
          currentImage={currentUser.avatar_url}
          title="Update profile photo"
          subtitle="Select a photo from your local device storage or pick an authentic photo from Apostle Joe Daniels gallery."
        />

      </div>
    </div>
  );
};
