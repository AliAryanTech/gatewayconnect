import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Radio, 
  Download, 
  Check, 
  Share2, 
  Flame, 
  Heart, 
  Sparkles, 
  MessageSquare, 
  Headphones, 
  Tv, 
  BookOpen, 
  Send,
  Calendar,
  Clock,
  ChevronRight,
  MapPin,
  Gift,
  CheckCircle2,
  ExternalLink,
  X,
  ChevronDown,
  ChevronUp,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Sermon, Devotional, Testimony, User } from '../../types';
import { StorageService } from '../../services/storageService';
import { MOCK_PARTNER_TICKERS } from '../../data/mockData';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { PaidBookingModal } from '../modals/PaidBookingModal';
import { cn } from '../../lib/utils';

interface HomeTabProps {
  sermons: Sermon[];
  devotionals: Devotional[];
  testimonies?: Testimony[];
  lowDataMode: boolean;
  currentUser?: User | null;
  onRequireAuth?: () => void;
  onOpenPremiumModal?: (sermon?: Sermon) => void;
  onNavigateToBible?: (reference?: string) => void;
  onNavigateTab?: (tab: any) => void;
  onOpenDevConsole?: () => void;
  onOpenAdminPanel?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  sermons,
  devotionals,
  testimonies = StorageService.getTestimonies(),
  lowDataMode,
  currentUser = StorageService.getCurrentUser(),
  onRequireAuth = () => {},
  onOpenPremiumModal,
  onNavigateToBible = (_reference?: string) => {},
  onNavigateTab,
}) => {
  const [activeSermon, setActiveSermon] = useState<Sermon>(sermons[0] || {} as Sermon);
  const [offlineIds, setOfflineIds] = useState<string[]>(StorageService.getOfflineSermonsList());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSeries, setSelectedSeries] = useState<string>('All');

  // Compute daily devotional dynamically based on the current calendar day
  const currentDevotional = React.useMemo(() => {
    if (!devotionals || devotionals.length === 0) return {} as Devotional;
    const now = new Date();
    // Unique day index
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const selected = devotionals[Math.abs(dayOfYear) % devotionals.length] || devotionals[0];
    const formattedDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    return {
      ...selected,
      date: `Today • ${formattedDate}`
    };
  }, [devotionals]);

  const isGuest = !currentUser || currentUser.role === 'guest';
  const isSermonUnlocked = !activeSermon?.is_premium || Boolean(currentUser?.is_premium) || Boolean(currentUser?.unlocked_sermon_ids?.includes(activeSermon?.id || ''));

  const handleToggleDownload = (sermonId: string) => {
    const res = StorageService.toggleOfflineSermon(sermonId);
    if (!res.success) {
      alert(res.message);
    }
    setOfflineIds(StorageService.getOfflineSermonsList());
  };

  const handleShareWhatsApp = (title: string, text: string) => {
    const shareText = `*Gateway Connect Zimbabwe* - Apostle Joe Daniels\n\n📌 *${title}*\n${text}\n\n📲 Watch and listen in Gateway Connect App!`;
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  // Filter sermons
  const filteredSermons = sermons.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.scriptures.some(sc => sc.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSeries = selectedSeries === 'All' || s.series === selectedSeries;
    return matchesSearch && matchesSeries;
  });

  const [showPaidBookingModal, setShowPaidBookingModal] = useState(false);

  const uniqueSeries = ['All', ...Array.from(new Set(sermons.map(s => s.series).filter(Boolean)))];

  const latestApostlePost = (testimonies || []).find(t => (t?.user_name || '').toLowerCase().includes('daniels')) || testimonies?.[0];

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-2 sm:px-4 pt-1">
      
      {/* 1. Researched Church Sanctuary Location */}
      <div className="bg-card/85 backdrop-blur-md border border-border rounded-xl px-3.5 py-2.5 overflow-hidden shadow-xs flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shrink-0 shadow-xs" title="Church Sanctuary Location">
          <MapPin className="w-4 h-4 fill-current text-primary" />
        </div>
        <div className="overflow-hidden relative w-full whitespace-nowrap text-xs text-foreground/90">
          <div className="animate-marquee flex items-center gap-8">
            <span className="font-semibold text-primary">
              Harare Assembly: Fantasyland Cinema Number 3 Harare, Zimbabwe
            </span>
            <span className="text-muted-foreground">
              • Gateway Cathedral: Samora Machel Avenue West, Belvedere, Harare
            </span>
            <span className="text-muted-foreground">
              • Sunday Glorious Service: 09:30 AM CAT
            </span>
            <span className="text-muted-foreground">
              • Midweek Dominion Service: Wednesday 17:30 CAT
            </span>
            <span className="text-muted-foreground">
              • Apostolic Secretariat & Intercession Desk • Connect via App
            </span>
          </div>
        </div>
      </div>

      {/* 3. Sleek Grid: Daily Devotional & Partner Wall */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Daily Devotional Card */}
        <div className="bg-card border border-border p-5 sm:p-6 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-primary text-xs font-bold tracking-widest uppercase">
                DAILY DEVOTIONAL
              </h3>
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
                {currentDevotional.date || 'Today'}
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-foreground">
              {currentDevotional.title}
            </h4>

            <blockquote className="text-xs sm:text-sm text-muted-foreground italic border-l-2 border-primary pl-3 py-1 bg-secondary/40 rounded-r-md">
              "{currentDevotional.scripture_verse}"
            </blockquote>

            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed line-clamp-3">
              {currentDevotional.content}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <button
              onClick={() => onNavigateToBible(currentDevotional.scripture_reference)}
              className="text-xs font-semibold border-b border-primary text-primary pb-0.5 hover:text-foreground transition-colors cursor-pointer"
            >
              READ FULL MESSAGE ({currentDevotional.scripture_reference})
            </button>

            <button
              onClick={() => handleShareWhatsApp(currentDevotional.title, `${currentDevotional.scripture_reference}\n\n${currentDevotional.declaration}`)}
              className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Partner Wall & Latest Community Updates Card */}
        <div className="bg-card border border-border p-5 sm:p-6 rounded-xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-primary text-xs font-bold tracking-widest uppercase">
                APOSTOLIC WORD & COMMUNITY FEED
              </h3>
              <span className="text-[10px] text-muted-foreground tracking-wider font-semibold">LIVE FEED</span>
            </div>

            {/* Featured Latest Apostle Post / Photo Update */}
            {latestApostlePost && (
              <div 
                onClick={() => onNavigateTab && onNavigateTab('community')}
                className="mb-3 bg-secondary/30 border border-border hover:border-primary/40 rounded-xl overflow-hidden cursor-pointer transition-all group"
              >
                {latestApostlePost.image_url && (
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <img 
                      src={latestApostlePost.image_url} 
                      alt={latestApostlePost.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-background/90 text-primary text-[10px] font-bold border border-border">
                      {latestApostlePost.category}
                    </span>
                    {latestApostlePost.scripture_tag && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-semibold">
                        {latestApostlePost.scripture_tag}
                      </span>
                    )}
                  </div>
                )}
                <div className="p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <img 
                      src={latestApostlePost.user_avatar || '/assets/apostle_joe_daniels_main.jpg'} 
                      alt={latestApostlePost.user_name} 
                      className="w-4 h-4 rounded-full object-cover border border-primary"
                    />
                    <span className="text-xs font-semibold text-foreground truncate">{latestApostlePost.user_name}</span>
                    <VerifiedBadge type="gold" size="xs" />
                    <span className="text-[10px] text-muted-foreground ml-auto">{latestApostlePost.date}</span>
                  </div>
                  <h5 className="text-xs font-bold text-primary line-clamp-1">{latestApostlePost.title}</h5>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{latestApostlePost.content}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-secondary/40 p-2.5 rounded-lg border border-border">
                <div className="w-1 h-6 bg-primary rounded-full shrink-0"></div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Recent Kingdom Seed</p>
                  <p className="text-xs font-semibold text-foreground">M. Chidzero (Harare) sowed $50 Cathedral Seed</p>
                </div>
              </div>

              {testimonies.filter((t) => t.id !== latestApostlePost?.id).slice(0, 1).map((test) => (
                <div 
                  key={test.id} 
                  onClick={() => onNavigateTab && onNavigateTab('community')}
                  className="flex items-center gap-2.5 bg-secondary/40 hover:bg-secondary/60 p-2 rounded-lg border border-border cursor-pointer transition-colors"
                >
                  {test.image_url ? (
                    <img src={test.image_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-border" />
                  ) : (
                    <div className="w-1 h-6 bg-emerald-500 rounded-full shrink-0"></div>
                  )}
                  <div className="overflow-hidden min-w-0 flex-1">
                    <p className="text-[10px] text-primary uppercase tracking-widest font-bold truncate">Praise: {test.category}</p>
                    <p className="text-xs text-foreground/90 truncate font-medium">{test.title} — {test.user_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Cathedral Foundation: 85% Funded</span>
            <span className="text-primary font-semibold">Harare Cathedral 2026</span>
          </div>
        </div>

      </div>

      {/* 4. Sermon Archive & Offline Downloader */}
      <div className="space-y-4 pt-2">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-xl font-bold text-foreground">
              Sermon Archive & Messages
            </h3>
            <p className="text-xs text-muted-foreground">
              Download messages for offline playback on 2G/3G connections.
            </p>
          </div>

          {/* Series Filter Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-secondary/60 rounded-xl border border-border overflow-x-auto no-scrollbar">
            {uniqueSeries.map((series) => (
              <button
                key={series}
                onClick={() => setSelectedSeries(series)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium tracking-wide shrink-0 transition-all uppercase cursor-pointer select-none',
                  selectedSeries === series
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                )}
              >
                {series}
              </button>
            ))}
          </div>
        </div>

        {/* Sermons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredSermons.map((sermon) => {
            const isDownloaded = offlineIds.includes(sermon.id);
            const isCurrent = activeSermon.id === sermon.id;

            return (
              <div
                key={sermon.id}
                className={cn(
                  'group rounded-xl border bg-card text-card-foreground shadow-xs transition-all flex flex-col justify-between overflow-hidden hover:shadow-md hover:border-primary/50',
                  isCurrent ? 'border-primary ring-1 ring-primary/30' : 'border-border'
                )}
              >
                <div className="p-3 sm:p-4 space-y-2.5">
                  <div 
                    onClick={() => {
                      setActiveSermon(sermon);
                      setOverridePlayingVideo({
                        id: sermon.id,
                        title: sermon.title,
                        youtube_id: sermon.youtube_id
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="relative aspect-video rounded-lg overflow-hidden bg-black cursor-pointer group"
                  >
                    <img
                      src={sermon.thumbnail_url}
                      alt={sermon.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                      <div className="w-11 h-11 rounded-full bg-background/80 backdrop-blur-md text-foreground flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
                      </div>
                    </div>
                    
                    {/* Duration badge */}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-background/85 backdrop-blur-md text-[10px] font-semibold text-foreground border border-border">
                      {sermon.duration}
                    </span>

                    {/* Offline or Active Playing badge */}
                    {overridePlayingVideo?.id === sermon.id ? (
                      <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary text-[10px] font-bold text-primary-foreground shadow-xs animate-pulse">
                        ▶ NOW PLAYING
                      </span>
                    ) : isDownloaded ? (
                      <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/90 text-[10px] font-bold text-white shadow-xs">
                        <Check className="w-3 h-3" />
                        Downloaded
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      {sermon.series}
                    </span>
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 mt-0.5">
                      {sermon.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                      {sermon.description}
                    </p>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-4 py-3 bg-secondary/40 border-t border-border flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveSermon(sermon);
                      setOverridePlayingVideo({
                        id: sermon.id,
                        title: sermon.title,
                        youtube_id: sermon.youtube_id
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch / Listen</span>
                  </button>

                  <button
                    id={`btn-download-sermon-${sermon.id}`}
                    onClick={() => handleToggleDownload(sermon.id)}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                      isDownloaded 
                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' 
                        : 'bg-secondary hover:bg-secondary/80 text-foreground/80 border border-border'
                    )}
                    title={isDownloaded ? "Remove from offline storage" : "Download for offline listening (Low data)"}
                  >
                    {isDownloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{isDownloaded ? 'Offline' : 'Save'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* 1-on-1 Paid Pastoral Booking Banner */}
      <div className="bg-card border border-border p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-sm sm:text-base text-foreground">
              Need 1-on-1 Pastoral Consultation?
            </h4>
            <p className="text-xs text-muted-foreground">
              Book a private session with Apostle Joe Daniels. Submissions forwarded directly to our ministry team.
            </p>
          </div>
        </div>

        <button
          id="btn-open-paid-booking-home"
          onClick={() => setShowPaidBookingModal(true)}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary hover:brightness-105 text-primary-foreground font-semibold text-xs uppercase tracking-wider shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          Book 1-on-1 Session
        </button>
      </div>

      <PaidBookingModal
        isOpen={showPaidBookingModal}
        onClose={() => setShowPaidBookingModal(false)}
      />

    </div>
  );
};
