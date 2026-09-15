import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MoreHorizontal, 
  Grid3X3, 
  Bookmark, 
  Tag, 
  UserPlus, 
  UserCheck, 
  Send, 
  Share2, 
  Link as LinkIcon, 
  MapPin, 
  Sparkles, 
  Check, 
  X,
  Heart,
  MessageCircle,
  Camera,
  Edit3
} from 'lucide-react';
import { User, Testimony, DirectMessage } from '../../types';
import { StorageService } from '../../services/storageService';
import { INITIAL_USERS } from '../../data/mockData';
import { VerifiedBadge } from '../common/VerifiedBadge';
import confetti from 'canvas-confetti';

interface InstagramProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDirectChat?: (targetUserId: string) => void;
  onSelectPost?: (post: Testimony) => void;
}

export const InstagramProfileModal: React.FC<InstagramProfileModalProps> = ({
  userId,
  isOpen,
  onClose,
  onOpenDirectChat,
  onSelectPost
}) => {
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Testimony[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'grid' | 'saved' | 'tagged'>('grid');
  
  // Direct Message Drawer State
  const [showDmDrawer, setShowDmDrawer] = useState<boolean>(false);
  const [dmList, setDmList] = useState<DirectMessage[]>([]);
  const [dmInputText, setDmInputText] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showProfileToast, setShowProfileToast] = useState<string | null>(null);

  // Edit Profile Drawer State
  const [showEditProfile, setShowEditProfile] = useState<boolean>(false);
  const [editFullName, setEditFullName] = useState<string>('');
  const [editHandle, setEditHandle] = useState<string>('');
  const [editBio, setEditBio] = useState<string>('');
  const [editLocation, setEditLocation] = useState<string>('');

  // 3-dots Profile Options Sheet
  const [showProfileOptions, setShowProfileOptions] = useState<boolean>(false);

  // Accurate Followers / Following List Viewer
  const [showFollowsListModal, setShowFollowsListModal] = useState<'followers' | 'following' | null>(null);
  const [followsUsersList, setFollowsUsersList] = useState<User[]>([]);
  const [profileHistory, setProfileHistory] = useState<string[]>([]);

  const currentUser = StorageService.getCurrentUser() || StorageService.getAllUsers()[0];
  const isMe = currentUser && profileUser && currentUser.id === profileUser.id;

  const triggerToast = (msg: string) => {
    setShowProfileToast(msg);
    setTimeout(() => setShowProfileToast(null), 2500);
  };

  const navigateToProfile = (targetUser: User) => {
    if (profileUser && profileUser.id !== targetUser.id) {
      setProfileHistory(prev => [...prev, profileUser.id]);
    }
    setProfileUser(targetUser);
    setShowFollowsListModal(null);
    setShowDmDrawer(false);
    setShowEditProfile(false);
  };

  const handleBack = () => {
    if (showEditProfile) {
      setShowEditProfile(false);
      return;
    }
    if (showFollowsListModal) {
      setShowFollowsListModal(null);
      return;
    }
    if (showDmDrawer) {
      setShowDmDrawer(false);
      return;
    }
    if (profileHistory.length > 0) {
      const prevId = profileHistory[profileHistory.length - 1];
      setProfileHistory(prev => prev.slice(0, prev.length - 1));
      const allUsers = StorageService.getAllUsers();
      const prevUser = allUsers.find(u => u.id === prevId || u.phone === prevId);
      if (prevUser) {
        setProfileUser(prevUser);
        return;
      }
    }
    onClose();
  };

  const handleClose = () => {
    if (showEditProfile) {
      setShowEditProfile(false);
      return;
    }
    if (showFollowsListModal) {
      setShowFollowsListModal(null);
      return;
    }
    if (showDmDrawer) {
      setShowDmDrawer(false);
      return;
    }
    if (profileHistory.length > 0) {
      const prevId = profileHistory[profileHistory.length - 1];
      setProfileHistory(prev => prev.slice(0, prev.length - 1));
      const allUsers = StorageService.getAllUsers();
      const prevUser = allUsers.find(u => u.id === prevId || u.phone === prevId);
      if (prevUser) {
        setProfileUser(prevUser);
        return;
      }
    }
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen || !userId) {
      setProfileUser(null);
      setShowDmDrawer(false);
      setShowFollowsListModal(null);
      setShowEditProfile(false);
      setProfileHistory([]);
      return;
    }

    // Resolve user details from live database
    const allUsers = StorageService.getAllUsers();
    let found = allUsers.find(u => 
      u.id === userId || 
      u.phone === userId || 
      u.handle === userId || 
      u.handle?.toLowerCase() === userId.toLowerCase() ||
      u.full_name.toLowerCase() === userId.toLowerCase()
    );
    
    // Fallback search in mock data
    if (!found) {
      found = INITIAL_USERS.find(u => 
        u.id === userId || 
        u.handle?.toLowerCase() === userId.toLowerCase() ||
        u.full_name.toLowerCase().includes(userId.toLowerCase())
      );
    }

    // Default synthesis if user is a guest or creator not yet registered
    if (!found) {
      found = {
        id: userId,
        full_name: userId.replace(/[@_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        handle: userId.startsWith('@') ? userId : `@${userId}`,
        phone: '+263770000000',
        role: 'member',
        member_id: `GCZ-${Math.floor(1000 + Math.random() * 9000)}`,
        is_verified: true,
        badge_type: 'silver',
        bio: 'Believer walking in covenant faith & supernatural acceleration at Gateway International Church.',
        location: 'Harare, Zimbabwe',
        created_at: new Date().toISOString(),
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
      };
    }

    setProfileUser(found);

    // Follow status
    const following = StorageService.isFollowingUser(currentUser.id, found.id);
    setIsFollowing(following);
    setFollowersCount(StorageService.getUserFollowersCount(found.id));
    setFollowingCount(StorageService.getUserFollowingCount(found.id));

    // User Posts
    const allTestimonies = StorageService.getTestimonies();
    const matches = allTestimonies.filter(t => 
      (t.user_id && t.user_id === found?.id) ||
      (t.user_handle && t.user_handle.toLowerCase() === found?.handle?.toLowerCase()) ||
      t.user_name.toLowerCase().includes(found?.full_name.toLowerCase() || '___')
    );

    // If no posts match specifically, include high-quality fallback posts so the Instagram grid looks full and vibrant
    if (matches.length === 0) {
      setUserPosts(allTestimonies.slice(0, 6));
    } else {
      setUserPosts(matches);
    }

    // Load DMs
    setDmList(StorageService.getDirectMessages(currentUser.id, found.id));
  }, [isOpen, userId]);

  useEffect(() => {
    const handleFollowChange = () => {
      if (profileUser) {
        setIsFollowing(StorageService.isFollowingUser(currentUser.id, profileUser.id));
        setFollowersCount(StorageService.getUserFollowersCount(profileUser.id));
        setFollowingCount(StorageService.getUserFollowingCount(profileUser.id));
      }
    };
    window.addEventListener('gcz_follow_updated', handleFollowChange);
    return () => window.removeEventListener('gcz_follow_updated', handleFollowChange);
  }, [profileUser, currentUser.id]);

  useEffect(() => {
    if (!profileUser || !showFollowsListModal) return;
    if (showFollowsListModal === 'followers') {
      const list = StorageService.getFollowersUsers(profileUser.id);
      setFollowsUsersList(list);
    } else {
      const list = StorageService.getFollowingUsers(profileUser.id);
      setFollowsUsersList(list);
    }
  }, [showFollowsListModal, profileUser?.id, followersCount, followingCount]);

  if (!isOpen || !profileUser) return null;

  const handleToggleFollow = () => {
    const result = StorageService.toggleFollowUser(profileUser.id);
    setIsFollowing(result.isFollowing);
    setFollowersCount(StorageService.getUserFollowersCount(profileUser.id));
    setFollowingCount(StorageService.getUserFollowingCount(profileUser.id));

    if (result.isFollowing) {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 }
      });
      triggerToast(`Now following ${profileUser.full_name}!`);
    } else {
      triggerToast(`Unfollowed ${profileUser.full_name}`);
    }

    window.dispatchEvent(new CustomEvent('gcz_follow_updated', {
      detail: { followerId: currentUser.id, targetUserId: profileUser.id, isFollowing: result.isFollowing }
    }));
  };

  const handleSendDm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmInputText.trim()) return;
    const msg = StorageService.sendDirectMessage(currentUser.id, profileUser.id, dmInputText.trim());
    setDmList(prev => [...prev, msg]);
    setDmInputText('');
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}?profile=${profileUser.handle || profileUser.id}`;
    const shareText = `Check out ${profileUser.full_name} (${profileUser.handle || '@gateway_member'}) on Gateway International Church:\n${profileUrl}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
    }
    triggerToast('Profile link copied! Opening WhatsApp...');
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleCopyLink = () => {
    const profileUrl = `${window.location.origin}?profile=${profileUser.handle || profileUser.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl);
    }
    setCopiedLink(true);
    triggerToast('Profile link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenEditProfile = () => {
    setEditFullName(profileUser.full_name || '');
    setEditHandle(profileUser.handle || '');
    setEditBio(profileUser.bio || '');
    setEditLocation(profileUser.location || '');
    setShowEditProfile(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = StorageService.updateUserProfile({
      full_name: editFullName.trim() || profileUser.full_name,
      handle: editHandle.trim() || profileUser.handle,
      bio: editBio.trim() || profileUser.bio,
      location: editLocation.trim() || profileUser.location,
    });
    if (updated) {
      setProfileUser(updated);
      window.dispatchEvent(new CustomEvent('gcz_user_profile_updated'));
      triggerToast('Profile updated successfully!');
    }
    setShowEditProfile(false);
  };

  const storyHighlights = [
    { id: 'h1', title: 'Altar Fire', img: '/assets/apostle_joe_daniels_preach.jpg' },
    { id: 'h2', title: 'Miracles', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80' },
    { id: 'h3', title: 'Harare \'26', img: '/assets/apostle_joe_daniels_main.jpg' },
    { id: 'h4', title: 'Praise Choir', img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop&q=80' },
  ];

  // Saved posts list (when isMe and tab is 'saved')
  const allTestimonies = StorageService.getTestimonies();
  const savedTestimonies = allTestimonies.filter(t => t.id && StorageService.isPostSaved ? StorageService.isPostSaved(t.id, currentUser.id) : false);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-hidden"
      onClick={handleClose}
    >
      <div 
        className="w-full sm:max-w-lg bg-[#001122] border border-white/10 sm:rounded-3xl h-[95vh] sm:h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Toast Banner */}
        {showProfileToast && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-emerald-400/40 animate-in fade-in slide-in-from-top-2">
            {showProfileToast}
          </div>
        )}

        {/* 1. INSTAGRAM TOP NAVIGATION BAR */}
        <header className="px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#00172e]">
          <button
            onClick={handleBack}
            className="p-1.5 -ml-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 font-bold text-sm text-white tracking-tight">
            <span>{profileUser.handle || `@${profileUser.full_name.toLowerCase().replace(/\s+/g, '_')}`}</span>
            {profileUser.is_verified && (
              <VerifiedBadge type={profileUser.badge_type || 'gold'} size="xs" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareProfile}
              className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Share profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowProfileOptions(true)}
              className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* 2. SCROLLABLE INSTAGRAM BODY */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          
          {/* PROFILE HEADER & STATS ROW */}
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              
              {/* Profile Avatar with Instagram Gradient Ring */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-lg">
                  <div className="w-full h-full rounded-full p-[2px] bg-[#001122]">
                    <img
                      src={profileUser.avatar_url || '/assets/apostle_joe_daniels_main.jpg'}
                      alt={profileUser.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Instagram Numbers Metric Bar (Posts, Followers, Following) */}
              <div className="flex-1 flex items-center justify-around text-center">
                <div className="cursor-pointer" onClick={() => setActiveTab('grid')}>
                  <span className="block font-black text-sm sm:text-base text-white">
                    {userPosts.length}
                  </span>
                  <span className="text-[11px] text-white/60">Posts</span>
                </div>

                <div 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setShowFollowsListModal('followers')}
                >
                  <span className="block font-black text-sm sm:text-base text-white">
                    {followersCount}
                  </span>
                  <span className="text-[11px] text-white/60">Followers</span>
                </div>

                <div 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setShowFollowsListModal('following')}
                >
                  <span className="block font-black text-sm sm:text-base text-white">
                    {followingCount}
                  </span>
                  <span className="text-[11px] text-white/60">Following</span>
                </div>
              </div>

            </div>

            {/* BIO & CREDENTIALS SECTION */}
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {profileUser.full_name}
                </h3>
                {profileUser.is_verified && (
                  <VerifiedBadge type={profileUser.badge_type || 'gold'} size="xs" />
                )}
                {profileUser.role === 'super_admin' && (
                  <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-bold">
                    Apostle / Overseer
                  </span>
                )}
                {profileUser.role === 'developer' && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                    System Developer
                  </span>
                )}
              </div>

              <p className="text-white/40 text-xs font-mono">
                {profileUser.handle || `@${profileUser.full_name.toLowerCase().replace(/\s+/g, '_')}`}
              </p>

              <p className="text-white/80 text-xs sm:text-sm leading-relaxed whitespace-pre-line pt-1">
                {profileUser.bio || 'Believer walking in covenant faith & supernatural acceleration at Gateway International Church.'}
              </p>

              {profileUser.location && (
                <p className="flex items-center gap-1 text-[11px] text-white/50 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{profileUser.location}</span>
                </p>
              )}

              <div 
                onClick={handleCopyLink}
                className="flex items-center gap-1 text-[#D4AF37] text-[11px] pt-0.5 font-medium hover:underline cursor-pointer"
              >
                <LinkIcon className="w-3 h-3" />
                <span>gatewayconnect.church/partner</span>
                {copiedLink && <span className="text-emerald-400 font-bold ml-1">✓ Copied</span>}
              </div>
            </div>

            {/* ACTION BUTTONS (Exact Instagram Style) */}
            <div className="flex items-center gap-2 pt-1">
              {isMe ? (
                <>
                  <button
                    id="btn-edit-profile-action"
                    onClick={handleOpenEditProfile}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={handleShareProfile}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Profile</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Follow / Following Toggle Button */}
                  <button
                    id="btn-instagram-follow-toggle"
                    onClick={handleToggleFollow}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                      isFollowing 
                        ? 'bg-white/15 text-white hover:bg-white/20 border border-white/15'
                        : 'bg-[#0070F3] hover:bg-blue-600 text-white shadow-md'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>

                  {/* Direct Message (DM) Button */}
                  <button
                    id="btn-instagram-message"
                    onClick={() => {
                      if (onOpenDirectChat) {
                        onOpenDirectChat(profileUser.id);
                      } else {
                        setShowDmDrawer(true);
                      }
                    }}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95 border border-white/10 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 -rotate-12" />
                    <span>Message</span>
                  </button>

                  {/* Share Profile Button */}
                  <button
                    onClick={handleShareProfile}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title="Share via WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* STORY HIGHLIGHTS TRAY */}
            <div className="pt-2">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {storyHighlights.map(h => (
                  <div key={h.id} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
                    <div className="w-14 h-14 rounded-full p-[2px] bg-white/20 group-hover:bg-[#D4AF37] transition-colors">
                      <img
                        src={h.img}
                        alt={h.title}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <span className="text-[10px] text-white/70 truncate max-w-[60px]">{h.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. INSTAGRAM TAB SWITCHER (Grid vs Saved vs Tagged) */}
          <div className="flex border-t border-white/10 bg-[#00172e]/50">
            <button
              onClick={() => setActiveTab('grid')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                activeTab === 'grid' 
                  ? 'border-white text-white' 
                  : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span>POSTS</span>
            </button>
            {isMe && (
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                  activeTab === 'saved' 
                    ? 'border-white text-white' 
                    : 'border-transparent text-white/40 hover:text-white/70'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>SAVED</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('tagged')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
                activeTab === 'tagged' 
                  ? 'border-white text-white' 
                  : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>TAGGED</span>
            </button>
          </div>

          {/* 4. 3-COLUMN SQUARE IMAGE GRID OR EMPTY STATE */}
          <div className="p-1">
            {activeTab === 'grid' && (
              userPosts.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mx-auto text-white/40">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white">No Posts Yet</p>
                  <p className="text-[11px] text-white/50 max-w-xs mx-auto">
                    When {isMe ? 'you share' : `${profileUser.full_name} shares`} testimonies and community updates, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {userPosts.map(post => (
                    <div
                      key={post.id}
                      onClick={() => {
                        if (onSelectPost) onSelectPost(post);
                        onClose();
                      }}
                      className="aspect-square bg-[#001F3F] relative group cursor-pointer overflow-hidden rounded-md"
                    >
                      <img
                        src={post.image_url || '/assets/apostle_joe_daniels_main.jpg'}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Hover Overlay with Likes & Comments Count */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-white" />
                          {post.likes_count || 12}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                          {post.comments?.length || 3}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'saved' && (
              savedTestimonies.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mx-auto text-[#D4AF37]/50">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white">No Saved Posts</p>
                  <p className="text-[11px] text-white/50 max-w-xs mx-auto">
                    Tap the bookmark icon on any post in the community feed to save praise reports and scriptures for easy reference.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {savedTestimonies.map(post => (
                    <div
                      key={post.id}
                      onClick={() => {
                        if (onSelectPost) onSelectPost(post);
                        onClose();
                      }}
                      className="aspect-square bg-[#001F3F] relative group cursor-pointer overflow-hidden rounded-md"
                    >
                      <img
                        src={post.image_url || '/assets/apostle_joe_daniels_main.jpg'}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                        <span className="flex items-center gap-1">
                          <Bookmark className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                          Saved
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'tagged' && (
              <div className="py-12 px-4 text-center space-y-2">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mx-auto text-white/40">
                  <Tag className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-white">Photos and Videos of {isMe ? 'You' : profileUser.full_name}</p>
                <p className="text-[11px] text-white/50 max-w-xs mx-auto">
                  When members tag {isMe ? 'you' : profileUser.full_name} in community testimonies or service decrees, they will appear here.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* EDIT PROFILE MODAL / DRAWER */}
        {showEditProfile && (
          <div className="absolute inset-0 z-50 bg-[#001122] flex flex-col animate-in slide-in-from-right-4 duration-200">
            <div className="px-4 py-3 bg-[#00172e] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="p-1 text-white/70 hover:text-white rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="font-bold text-sm text-white">Edit Profile</h3>
              </div>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-3 py-1 bg-primary text-primary-foreground font-bold text-xs rounded-lg shadow cursor-pointer"
              >
                Save
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-4 space-y-4 overflow-y-auto flex-1">
              <div className="flex flex-col items-center gap-2 pb-2">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#D4AF37]">
                  <img
                    src={profileUser.avatar_url || '/assets/apostle_joe_daniels_main.jpg'}
                    alt={profileUser.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-[#D4AF37] font-semibold">Profile Photo Synced</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Handle / Username</label>
                <input
                  type="text"
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
                  placeholder="Share a short bio or prophetic decree..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Location / City</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="e.g. Harare, Zimbabwe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Profile Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3-DOTS MORE OPTIONS SHEET */}
        {showProfileOptions && (
          <div 
            className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end justify-center p-3 animate-in fade-in duration-150"
            onClick={() => setShowProfileOptions(false)}
          >
            <div 
              className="w-full bg-[#00172e] border border-white/15 rounded-2xl overflow-hidden divide-y divide-white/10 text-xs text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  handleCopyLink();
                  setShowProfileOptions(false);
                }}
                className="w-full py-3.5 text-white font-semibold hover:bg-white/5 transition-colors cursor-pointer"
              >
                Copy Profile Link
              </button>
              <button
                type="button"
                onClick={() => {
                  handleShareProfile();
                  setShowProfileOptions(false);
                }}
                className="w-full py-3.5 text-emerald-400 font-semibold hover:bg-white/5 transition-colors cursor-pointer"
              >
                Share via WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setShowProfileOptions(false)}
                className="w-full py-3.5 text-white/50 font-bold hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* DIRECT MESSAGE (DM) MODAL / SHEET */}
        {showDmDrawer && (
          <div className="absolute inset-0 z-50 bg-[#001122] flex flex-col animate-in slide-in-from-right-4 duration-200">
            <div className="px-4 py-3 bg-[#00172e] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowDmDrawer(false)}
                  className="p-1 text-white/70 hover:text-white rounded-full cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D4AF37]/50">
                  <img
                    src={profileUser.avatar_url || '/assets/apostle_joe_daniels_main.jpg'}
                    alt={profileUser.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-white flex items-center gap-1">
                    <span>{profileUser.full_name}</span>
                    {profileUser.is_verified && <VerifiedBadge type="gold" size="xs" />}
                  </h3>
                  <p className="text-[10px] text-emerald-400">Direct Chat</p>
                </div>
              </div>

              <button
                onClick={() => setShowDmDrawer(false)}
                className="p-1 text-white/50 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* DM Messages Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
              {dmList.length === 0 ? (
                <div className="text-center py-16 text-white/40 text-xs">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]" />
                  <p className="font-semibold text-white/70">Send a greeting in Christ</p>
                  <p className="text-[10px] text-white/40">Messages sent here are private between you and {profileUser.full_name}.</p>
                </div>
              ) : (
                dmList.map((m) => {
                  const isFromMe = m.sender_id === currentUser.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-[80%] ${
                        isFromMe ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isFromMe
                            ? 'bg-[#0070F3] text-white rounded-br-sm shadow-md'
                            : 'bg-white/10 text-white rounded-bl-sm border border-white/10'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[9px] text-white/40 mt-1 px-1">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* DM Input Bar */}
            <form onSubmit={handleSendDm} className="p-3 bg-[#00172e] border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                value={dmInputText}
                onChange={(e) => setDmInputText(e.target.value)}
                placeholder={`Message ${profileUser.full_name}...`}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={!dmInputText.trim()}
                className="p-2.5 rounded-full bg-[#0070F3] hover:bg-blue-600 disabled:opacity-40 text-white font-bold transition-all shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ACCURATE FOLLOWERS / FOLLOWING LIST MODAL */}
        {showFollowsListModal && (
          <div className="absolute inset-0 z-50 bg-[#001122] flex flex-col animate-in slide-in-from-right-4 duration-200">
            {/* Header */}
            <div className="px-4 py-3 bg-[#00172e] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowFollowsListModal(null)}
                  className="p-1 text-white/70 hover:text-white rounded-full cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-bold text-sm text-white capitalize">
                    {showFollowsListModal}
                  </h3>
                  <p className="text-[11px] text-white/50">
                    {showFollowsListModal === 'followers' 
                      ? `${followersCount} ${followersCount === 1 ? 'follower' : 'followers'}`
                      : `${followingCount} following`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowFollowsListModal(null)}
                className="p-1.5 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Users List */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {followsUsersList.length === 0 ? (
                <div className="text-center py-12 text-white/40 text-xs">
                  <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#D4AF37]" />
                  <p>No {showFollowsListModal} to display yet.</p>
                </div>
              ) : (
                followsUsersList.map(u => {
                  const isFollowingThisUser = StorageService.isFollowingUser(currentUser.id, u.id);
                  const isSelf = currentUser.id === u.id;

                  return (
                    <div
                      key={u.id}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between gap-3 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          navigateToProfile(u);
                        }}
                        className="flex items-center gap-3 min-w-0 text-left cursor-pointer flex-1"
                      >
                        <img
                          src={u.avatar_url || '/assets/apostle_joe_daniels_main.jpg'}
                          alt={u.full_name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-white truncate flex items-center gap-1">
                            <span>{u.full_name}</span>
                            {u.is_verified && <VerifiedBadge type={u.badge_type || 'blue'} size="xs" />}
                          </h4>
                          <p className="text-[11px] text-white/50 truncate">
                            {u.handle || `@${u.full_name.toLowerCase().replace(/\s+/g, '_')}`}
                          </p>
                        </div>
                      </button>

                      {!isSelf && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              StorageService.toggleFollowUser(u.id);
                              setFollowersCount(StorageService.getUserFollowersCount(profileUser.id));
                              setFollowingCount(StorageService.getUserFollowingCount(profileUser.id));
                              if (showFollowsListModal === 'followers') {
                                setFollowsUsersList(StorageService.getFollowersUsers(profileUser.id));
                              } else {
                                setFollowsUsersList(StorageService.getFollowingUsers(profileUser.id));
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isFollowingThisUser
                                ? 'bg-white/10 text-white/80 hover:bg-white/20'
                                : 'bg-[#0070F3] text-white hover:bg-blue-600'
                            }`}
                          >
                            {isFollowingThisUser ? 'Following' : 'Follow'}
                          </button>

                          {onOpenDirectChat && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowFollowsListModal(null);
                                onOpenDirectChat(u.id);
                              }}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer"
                              title="Send Message"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
