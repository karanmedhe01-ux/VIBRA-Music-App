"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { App } from "@capacitor/app";
import {
  Album,
  ArrowLeft,
  Bell,
  ChevronDown,
  ChevronRight,
  Clock3,
  Compass,
  Download,
  Ellipsis,
  Heart,
  Home as HomeIcon,
  ListMusic,
  Menu,
  Mic2,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Radio,
  Repeat2,
  Search as SearchIcon,
  Settings,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  UserRound,
  Volume2,
  X,
} from "lucide-react";

type Song = {
  title: string;
  artist: string;
  cover: string;
  duration: string;
  audioUrl: string;
};

type ApkStatus = "checking" | "ready" | "error";

const APK_DOWNLOAD_URL = "/VIBRA-debug.apk";

const covers = {
  midnight:
    "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85",
  rose:
    "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=700&q=85",
  gold:
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=85",
  blue:
    "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=700&q=85",
  ocean:
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=700&q=85",
  face:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85",
  desert:
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=700&q=85",
  coast:
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=700&q=85",
};

const songs: Song[] = [
  // SoundHelix demo tracks are used here so the player works without an API key.
  { title: "Midnight City", artist: "M83", cover: covers.midnight, duration: "4:03", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "The Color Violet", artist: "Tory Lanez", cover: covers.rose, duration: "3:46", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Innerbloom", artist: "RÜFÜS DU SOL", cover: covers.gold, duration: "9:35", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { title: "Sweet Disposition", artist: "The Temper Trap", cover: covers.blue, duration: "3:54", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { title: "Sunset Lover", artist: "Petit Biscuit", cover: covers.ocean, duration: "3:58", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { title: "After Dark", artist: "Mr.Kitty", cover: covers.face, duration: "4:17", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
];

const navItems = [
  { label: "Home", icon: HomeIcon },
  { label: "Discover", icon: Compass },
  { label: "Search", icon: SearchIcon },
  { label: "Your Library", icon: Album },
];

const moods = [
  ["Chill", "#7b86d9"],
  ["Focus", "#dfa864"],
  ["Workout", "#dc6b72"],
  ["Party", "#ab72c8"],
  ["Sleep", "#597c9e"],
];

function Artwork({ src, className = "" }: { src: string; className?: string }) {
  return <img src={src} alt="" className={`artwork ${className}`} />;
}

function PlayButton({ onClick, small = false }: { onClick?: () => void; small?: boolean }) {
  return (
    <button aria-label="Play" onClick={onClick} className={`play-button ${small ? "play-button-small" : ""}`}>
      <Play size={small ? 14 : 17} fill="currentColor" strokeWidth={0} />
    </button>
  );
}

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeNav, setActiveNav] = useState("Home");
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSong, setSelectedSong] = useState(songs[0]);
  const [queue, setQueue] = useState<Song[]>(songs);
  const [queueIndex, setQueueIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [apkStatus, setApkStatus] = useState<ApkStatus>("checking");
  const [backToastVisible, setBackToastVisible] = useState(false);
  const navigationStackRef = useRef<string[]>(["Home"]);
  const backArmedRef = useRef(false);
  const backTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackTapRef = useRef(0);

  const checkApk = useCallback(async () => {
    setApkStatus("checking");
    try {
      const response = await fetch(APK_DOWNLOAD_URL, { method: "HEAD", cache: "no-store" });
      setApkStatus(response.ok ? "ready" : "error");
    } catch {
      setApkStatus("error");
    }
  }, []);

  useEffect(() => {
    void checkApk();
  }, [checkApk]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.preload = "metadata";
    audio.volume = volume;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDurationSeconds(Number.isFinite(audio.duration) ? audio.duration : 0);
    const handleWaiting = () => setIsLoading(true);
    const handlePlay = () => setPlaying(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setPlaybackError(null);
    };
    const handlePause = () => setPlaying(false);
    const handleEnded = () => nextSongRef.current();
    const handleError = () => {
      setIsLoading(false);
      setPlaying(false);
      const mediaError = audio.error;
      const errorCode = mediaError?.code ? ` (code ${mediaError.code})` : "";
      setPlaybackError(`Audio could not be loaded${errorCode}. Check your connection or try another track.`);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const startSong = useCallback((song: Song, autoplay = true) => {
    const audio = audioRef.current;
    const nextIndex = songs.findIndex((item) => item.audioUrl === song.audioUrl);
    setSelectedSong(song);
    setQueueIndex(nextIndex >= 0 ? nextIndex : 0);
    setCurrentTime(0);
    setDurationSeconds(0);
    setPlaybackError(null);
    if (!audio || !song.audioUrl.trim()) {
      setPlaying(false);
      setPlaybackError("This track does not have a valid audio source.");
      return;
    }
    audio.pause();
    audio.src = song.audioUrl;
    audio.load();
    if (autoplay) {
      setIsLoading(true);
      audio.play().catch((error: unknown) => {
        setIsLoading(false);
        setPlaying(false);
        setPlaybackError(error instanceof DOMException && error.name === "NotAllowedError"
          ? "Playback was blocked by the browser. Tap Play to start audio."
          : "Audio could not start. Check your connection and try again.");
      });
    } else {
      setIsLoading(false);
      setPlaying(false);
    }
  }, []);

  const togglePlayback = useCallback(() => {
    const now = Date.now();
    if (now - playbackTapRef.current < 280) return;
    playbackTapRef.current = now;
    const audio = audioRef.current;
    if (!audio || !audio.src) {
      startSong(selectedSong);
      return;
    }
    if (audio.paused) {
      setIsLoading(true);
      audio.play().catch(() => {
        setIsLoading(false);
        setPlaybackError("Playback was blocked by the browser. Tap Play to start audio.");
      });
    } else {
      audio.pause();
    }
  }, [selectedSong, startSong]);

  const playSong = useCallback((song: Song) => startSong(song), [startSong]);
  const nextSong = useCallback(() => {
    const nextIndex = (queueIndex + 1) % queue.length;
    startSong(queue[nextIndex]);
  }, [queue, queueIndex, startSong]);
  const previousSong = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const previousIndex = (queueIndex - 1 + queue.length) % queue.length;
    startSong(queue[previousIndex]);
  }, [queue, queueIndex, startSong]);
  const nextSongRef = useRef(nextSong);
  nextSongRef.current = nextSong;

  const goBack = useCallback(() => {
    if (menuOpen) {
      setMenuOpen(false);
      return true;
    }
    if (showPlayer) {
      setShowPlayer(false);
      return true;
    }
    if (navigationStackRef.current.length > 1) {
      const stack = navigationStackRef.current.slice(0, -1);
      navigationStackRef.current = stack;
      setActiveNav(stack[stack.length - 1] ?? "Home");
      return true;
    }
    return false;
  }, [menuOpen, showPlayer]);

  const handleBackPress = useCallback(() => {
    if (goBack()) return;
    if (backArmedRef.current) {
      backArmedRef.current = false;
      setBackToastVisible(false);
      if (backTimerRef.current) clearTimeout(backTimerRef.current);
      void App.exitApp().catch(() => undefined);
      return;
    }
    backArmedRef.current = true;
    setBackToastVisible(true);
    if (backTimerRef.current) clearTimeout(backTimerRef.current);
    backTimerRef.current = setTimeout(() => {
      backArmedRef.current = false;
      setBackToastVisible(false);
    }, 2000);
  }, [goBack]);

  useEffect(() => {
    let pluginListener: { remove: () => Promise<void> } | null = null;
    const registerBackButton = async () => {
      try {
        pluginListener = await App.addListener("backButton", handleBackPress);
      } catch {
        // The Capacitor App plugin is unavailable in a regular browser preview.
      }
    };
    void registerBackButton();
    const handleBrowserBack = () => handleBackPress();
    window.addEventListener("popstate", handleBrowserBack);
    return () => {
      window.removeEventListener("popstate", handleBrowserBack);
      if (backTimerRef.current) clearTimeout(backTimerRef.current);
      void pluginListener?.remove();
    };
  }, [handleBackPress]);

  const seek = (nextTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
  };

  const filteredSongs = useMemo(
    () => songs.filter((song) => `${song.title} ${song.artist}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const navigate = (label: string) => {
    if (label === activeNav) {
      setMenuOpen(false);
      return;
    }
    navigationStackRef.current = label === "Home"
      ? ["Home"]
      : [...navigationStackRef.current, label];
    setActiveNav(label);
    setShowPlayer(false);
    setMenuOpen(false);
    window.history.pushState({ vibra: true, screen: label }, "", window.location.href);
  };

  return (
    <div className="vibra-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><span /></span><span>VIBRA</span></div>
        <div className="sidebar-section">
          <p className="eyebrow">Menu</p>
          <nav>
            {navItems.map(({ label, icon: Icon }) => (
              <button key={label} onClick={() => navigate(label)} className={`nav-item ${activeNav === label ? "active" : ""}`}>
                <Icon size={18} strokeWidth={activeNav === label ? 2.4 : 1.8} />
                <span>{label}</span>
                {label === "Search" && <span className="shortcut">⌘ K</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="sidebar-section collection-section">
          <p className="eyebrow">Your Collection</p>
          <button className="nav-item" onClick={() => navigate("Your Library")}><Heart size={18} /><span>Liked Songs</span></button>
          <button className="nav-item" onClick={() => navigate("Playlists")}><ListMusic size={18} /><span>Playlists</span></button>
          <button className="nav-item" onClick={() => navigate("Your Library")}><Clock3 size={18} /><span>Recently Played</span></button>
        </div>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => navigate("Settings")}><Settings size={18} /><span>Settings</span></button>
          <div className="upgrade-card"><Sparkles size={18} /><strong>Go Premium</strong><span>Unlock your listening</span><button>Upgrade now <ChevronRight size={13} /></button></div>
          <div className="profile-row"><div className="avatar">AL</div><div><strong>Alex Morgan</strong><span>VIBRA member</span></div><MoreHorizontal size={18} /></div>
        </div>
      </aside>

      <main className="main-content">
        <audio ref={audioRef} preload="metadata" aria-hidden="true" />
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark"><span /></span>VIBRA</div>
          <div className="breadcrumbs"><span>Music</span><ChevronRight size={14} /><strong>{activeNav}</strong></div>
          <div className="top-actions">
            <button className="icon-button"><Bell size={18} /></button>
            <div className="top-profile"><div className="avatar avatar-small">AM</div><ChevronDown size={14} /></div>
            <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={20} /></button>
          </div>
        </header>

        <div className="screen-stage" key={`${activeNav}-${showPlayer ? "player" : "browse"}`}>
          {activeNav === "Search" ? (
            <SearchView search={search} setSearch={setSearch} songs={filteredSongs} playSong={playSong} />
          ) : activeNav === "Your Library" || activeNav === "Playlists" ? (
            <LibraryView liked={liked} setShowPlayer={setShowPlayer} playSong={playSong} />
          ) : activeNav === "Settings" ? (
            <SettingsView />
          ) : activeNav === "Discover" ? (
            <DiscoverView playSong={playSong} />
          ) : (
            <HomeView playing={playing} setPlaying={setPlaying} liked={liked} setLiked={setLiked} playSong={playSong} setShowPlayer={setShowPlayer} apkStatus={apkStatus} retryApk={checkApk} />
          )}
        </div>

        {!showPlayer && <MiniPlayer song={selectedSong} playing={playing} liked={liked} setLiked={setLiked} togglePlayback={togglePlayback} setShowPlayer={setShowPlayer} currentTime={currentTime} durationSeconds={durationSeconds} isLoading={isLoading} playbackError={playbackError} nextSong={nextSong} />}
        {showPlayer && <FullPlayer song={selectedSong} playing={playing} togglePlayback={togglePlayback} liked={liked} setLiked={setLiked} close={() => setShowPlayer(false)} currentTime={currentTime} durationSeconds={durationSeconds} seek={seek} previousSong={previousSong} nextSong={nextSong} volume={volume} setVolume={setVolume} isLoading={isLoading} playbackError={playbackError} queue={queue} setQueue={setQueue} playSong={playSong} />}
      </main>
      {menuOpen && <div className="mobile-nav-popover"><button onClick={() => { navigate("Home"); setMenuOpen(false); }}>Home</button><button onClick={() => { navigate("Search"); setMenuOpen(false); }}>Search</button><button onClick={() => { navigate("Your Library"); setMenuOpen(false); }}>Library</button><button onClick={() => { navigate("Settings"); setMenuOpen(false); }}>Settings</button></div>}
      {backToastVisible && <div className="vibra-toast" role="status" aria-live="polite"><span className="toast-dot" /><span>Press back again to exit</span><i /></div>}
    </div>
  );
}

function HomeView({ playing, setPlaying, liked, setLiked, playSong, setShowPlayer, apkStatus, retryApk }: { playing: boolean; setPlaying: (v: boolean) => void; liked: boolean; setLiked: (v: boolean) => void; playSong: (song: Song) => void; setShowPlayer: (v: boolean) => void; apkStatus: ApkStatus; retryApk: () => void }) {
  return (
    <div className="page home-page">
      <section className="welcome-row"><div><p className="overline">Tuesday, August 12</p><h1>Good evening, Alex <span>✦</span></h1><p className="subtle">A little music for wherever you are.</p></div><button className="listen-button" onClick={() => { playSong(songs[0]); setShowPlayer(true); }}><Play size={15} fill="currentColor" /> Start listening</button></section>
      <section className="hero-banner">
        <div className="hero-copy"><p className="overline accent-text">VIBRA ORIGINAL • DAILY MIX</p><h2>Your evening<br /><em>in stereo.</em></h2><p>Dreamy electronics, warm vocals, and slow-burn grooves curated for your night.</p><div className="hero-actions"><button className="hero-button" onClick={() => playSong(songs[0])}>Play mix <Play size={14} fill="currentColor" /></button><AndroidDownload status={apkStatus} retry={retryApk} /></div><div className="hero-dots"><span className="selected" /><span /><span /><span /></div></div>
        <div className="hero-art"><Artwork src={covers.midnight} /><div className="hero-disc"><div>V</div></div><div className="floating-note note-one">♪</div><div className="floating-note note-two">♫</div></div>
      </section>
      <section className="mood-row"><div className="section-heading"><h2>How are you feeling?</h2><span>Pick a mood</span></div><div className="moods">{moods.map(([name, color]) => <button key={name} className="mood-pill" style={{ "--mood": color } as React.CSSProperties}><span className="mood-icon">{name === "Chill" ? "◒" : name === "Focus" ? "◐" : name === "Workout" ? "↗" : name === "Party" ? "✦" : "☾"}</span>{name}</button>)}</div></section>
      <MusicSection title="Made for you" link="See all"><div className="horizontal-cards">{songs.slice(0, 5).map((song, i) => <AlbumCard key={song.title} song={song} tag={i === 0 ? "For your night" : undefined} onPlay={() => { playSong(song); setPlaying(true); }} onOpen={() => setShowPlayer(true)} />)}</div></MusicSection>
      <MusicSection title="Recently played" link="View history"><div className="recent-grid">{songs.slice(1, 5).map((song) => <RecentRow key={song.title} song={song} onPlay={() => { playSong(song); setPlaying(true); }} />)}</div></MusicSection>
      <MusicSection title="Trending now" link="See all"><div className="horizontal-cards">{songs.slice(2).concat(songs.slice(0, 1)).map((song) => <AlbumCard key={`trend-${song.title}`} song={song} onPlay={() => { playSong(song); setPlaying(true); }} onOpen={() => setShowPlayer(true)} />)}</div></MusicSection>
      <section className="split-sections"><MusicSection title="Popular playlists" link="Explore"><div className="playlist-list"><PlaylistItem title="Late Night Drive" subtitle="VIBRA · 32 songs" cover={covers.coast} /><PlaylistItem title="Soft Focus" subtitle="VIBRA · 48 songs" cover={covers.blue} /></div></MusicSection><MusicSection title="Daily mixes" link="Refresh"><div className="mix-list"><div className="mix-card mix-purple"><span>Mix 01</span><strong>Made for<br />your mood</strong><PlayButton small onClick={() => setPlaying(!playing)} /></div><div className="mix-card mix-orange"><span>Mix 02</span><strong>Fresh<br />discoveries</strong><PlayButton small onClick={() => setPlaying(!playing)} /></div></div></MusicSection></section>
      <MusicSection title="Recommended artists" link="See all"><div className="artist-row"><Artist name="Maggie Rogers" image={covers.face} /><Artist name="Bonobo" image={covers.ocean} /><Artist name="Lana Del Rey" image={covers.rose} /><Artist name="Jamie xx" image={covers.desert} /><Artist name="Nujabes" image={covers.midnight} /></div></MusicSection>
      <section className="download-footer"><div><p className="overline accent-text">READY WHEN YOU ARE</p><h2>Get VIBRA for Android</h2><p>Take your music with you, wherever the day leads.</p></div><div className="download-actions"><AndroidDownload status={apkStatus} retry={retryApk} compact /><a className="install-link" href={APK_DOWNLOAD_URL} download="VIBRA-debug.apk">Install on Android <ChevronRight size={14} /></a></div></section><div className="bottom-space" />
    </div>
  );
}

function AndroidDownload({ status, retry, compact = false }: { status: ApkStatus; retry: () => void; compact?: boolean }) {
  if (status === "error") {
    return <button className={`android-download download-error ${compact ? "compact" : ""}`} onClick={retry}><Download size={17} /><span><strong>APK unavailable</strong><small>Tap to retry</small></span><X size={15} /></button>;
  }
  return <a className={`android-download ${compact ? "compact" : ""} ${status === "checking" ? "is-checking" : ""}`} href={APK_DOWNLOAD_URL} download="VIBRA-debug.apk" aria-disabled={status !== "ready"} onClick={(event) => { if (status !== "ready") event.preventDefault(); }}><Download size={17} /><span><strong>{compact ? "Download APK" : "Download VIBRA for Android"}</strong><small>{status === "checking" ? "Checking latest APK..." : "APK v1.0 · 8.8 MB"}</small></span><ChevronRight size={15} /></a>;
}

function MusicSection({ title, link, children }: { title: string; link: string; children: React.ReactNode }) {
  return <section className="music-section"><div className="section-heading"><h2>{title}</h2><button>{link} <ChevronRight size={15} /></button></div>{children}</section>;
}

function AlbumCard({ song, tag, onPlay, onOpen }: { song: Song; tag?: string; onPlay: () => void; onOpen: () => void }) {
  return <article className="album-card"><div className="album-cover-wrap" onClick={onOpen}><Artwork src={song.cover} /><button className="cover-play" onClick={(e) => { e.stopPropagation(); onPlay(); }}><Play size={17} fill="currentColor" /></button>{tag && <span className="cover-tag">{tag}</span>}</div><div className="card-title">{song.title}</div><div className="card-artist">{song.artist}</div></article>;
}

function RecentRow({ song, onPlay }: { song: Song; onPlay: () => void }) {
  return <div className="recent-row"><Artwork src={song.cover} className="recent-art" /><div className="recent-info"><strong>{song.title}</strong><span>{song.artist}</span></div><button className="row-play" onClick={onPlay}><Play size={15} fill="currentColor" /></button><span className="duration">{song.duration}</span><button className="more-button"><Ellipsis size={18} /></button></div>;
}

function PlaylistItem({ title, subtitle, cover }: { title: string; subtitle: string; cover: string }) { return <div className="playlist-item"><Artwork src={cover} className="playlist-art" /><div><strong>{title}</strong><span>{subtitle}</span></div><MoreHorizontal size={18} /></div>; }
function Artist({ name, image }: { name: string; image: string }) { return <div className="artist"><Artwork src={image} className="artist-art" /><strong>{name}</strong><span>Artist</span></div>; }

function MiniPlayer({ song, playing, liked, setLiked, togglePlayback, setShowPlayer, currentTime, durationSeconds, isLoading, playbackError, nextSong }: { song: Song; playing: boolean; liked: boolean; setLiked: (v: boolean) => void; togglePlayback: () => void; setShowPlayer: (v: boolean) => void; currentTime: number; durationSeconds: number; isLoading: boolean; playbackError: string | null; nextSong: () => void }) {
  const progress = durationSeconds ? `${Math.min(100, (currentTime / durationSeconds) * 100)}%` : "0%";
  return <div className="mini-player"><div className="mini-song" onClick={() => setShowPlayer(true)}><Artwork src={song.cover} className="mini-art" /><div><strong>{song.title}</strong><span>{song.artist}</span></div></div><div className="mini-controls"><button onClick={togglePlayback} className="mini-main" aria-label={playing ? "Pause" : "Play"}>{isLoading ? <span className="spinner" /> : playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}</button><button onClick={nextSong} aria-label="Next track"><SkipForward size={17} /></button></div><div className={`mini-progress ${playbackError ? "has-error" : ""}`} title={playbackError ?? (playing ? "Playing" : "Paused")}><span style={{ width: progress }} /><i style={{ left: progress }} /></div><button className={`mini-heart ${liked ? "liked" : ""}`} onClick={() => setLiked(!liked)}><Heart size={18} fill={liked ? "currentColor" : "none"} /></button><button className="queue-button" onClick={() => setShowPlayer(true)}><ListMusic size={18} /></button></div>;
}

function FullPlayer({ song, playing, togglePlayback, liked, setLiked, close, currentTime, durationSeconds, seek, previousSong, nextSong, volume, setVolume, isLoading, playbackError, queue, setQueue, playSong }: { song: Song; playing: boolean; togglePlayback: () => void; liked: boolean; setLiked: (v: boolean) => void; close: () => void; currentTime: number; durationSeconds: number; seek: (value: number) => void; previousSong: () => void; nextSong: () => void; volume: number; setVolume: (v: number) => void; isLoading: boolean; playbackError: string | null; queue: Song[]; setQueue: (songs: Song[]) => void; playSong: (song: Song) => void }) {
  const progress = durationSeconds ? Math.min(100, (currentTime / durationSeconds) * 100) : 0;
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  return <div className="full-player"><div className="player-top"><button onClick={close} className="back-button"><ArrowLeft size={20} /><span>Back to browsing</span></button><span>NOW PLAYING</span><button className="icon-button"><MoreHorizontal size={20} /></button></div><div className="player-body"><div className="player-art-wrap"><Artwork src={song.cover} className="player-art" /><div className="player-glow" /></div><div className="player-details"><div className="player-label">PLAYING FROM <span>Evening Mix</span></div><h1>{song.title}</h1><h3>{song.artist}</h3><div className="playback-status">{isLoading ? "Loading demo audio..." : playbackError ? <><span>{playbackError}</span><button onClick={togglePlayback}>Retry</button></> : playing ? "Now playing" : "Paused"}</div><div className="player-progress"><div className="progress-line" style={{ "--progress": `${progress}%` } as React.CSSProperties}><input type="range" min="0" max={durationSeconds || 1} step="0.1" value={Math.min(currentTime, durationSeconds || 1)} onChange={(event) => seek(Number(event.target.value))} aria-label="Seek through song" /></div><div><span>{formatTime(currentTime)}</span><span>{durationSeconds ? formatTime(durationSeconds) : song.duration}</span></div></div><div className="player-controls"><button aria-label="Shuffle"><Shuffle size={20} /></button><button onClick={previousSong} aria-label="Previous track"><SkipBack size={25} fill="currentColor" /></button><button className="player-play" onClick={togglePlayback} aria-label={playing ? "Pause" : "Play"}>{isLoading ? <span className="spinner spinner-dark" /> : playing ? <Pause size={25} fill="currentColor" /> : <Play size={25} fill="currentColor" />}</button><button onClick={nextSong} aria-label="Next track"><SkipForward size={25} fill="currentColor" /></button><button aria-label="Repeat"><Repeat2 size={20} /></button></div><div className="player-actions"><button className={liked ? "liked" : ""} onClick={() => setLiked(!liked)}><Heart size={19} fill={liked ? "currentColor" : "none"} /> Favorite</button><button><Plus size={19} /> Add to playlist</button><button><Share2 size={18} /> Share</button><button><Mic2 size={18} /> Lyrics</button><button><Clock3 size={18} /> Sleep timer</button></div><label className="player-volume"><Volume2 size={17} /><input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Volume" /></label></div></div><div className="queue-panel"><div><span className="overline">UP NEXT</span><h3>Queue <span>{queue.length} songs</span></h3></div><button>View queue <ChevronRight size={15} /></button>{queue.filter((item) => item.audioUrl !== song.audioUrl).slice(0, 4).map((item) => <button className="queue-track" key={item.audioUrl} onClick={() => playSong(item)}><Artwork src={item.cover} className="queue-art" /><div><strong>{item.title}</strong><span>{item.artist}</span></div><span>{item.duration}</span></button>)}<button className="queue-add" onClick={() => setQueue([...queue, songs[(queue.length + 1) % songs.length]])}><Plus size={15} /> Add demo track to queue</button></div></div>;
}

function SearchView({ search, setSearch, songs, playSong }: { search: string; setSearch: (v: string) => void; songs: Song[]; playSong: (song: Song) => void }) {
  return <div className="page search-page"><div className="search-intro"><p className="overline accent-text">FIND YOUR FREQUENCY</p><h1>What are you<br /><em>in the mood for?</em></h1><div className="search-input"><SearchIcon size={21} /><input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search songs, artists, albums..." />{search && <button onClick={() => setSearch("")}><X size={18} /></button>}<span>⌘ K</span></div></div>{search ? <MusicSection title={`Results for “${search}”`} link=""><div className="search-results">{songs.length ? songs.map((song, i) => <div className="result-row" key={song.title}><span className="result-number">0{i + 1}</span><Artwork src={song.cover} className="result-art" /><div><strong>{song.title}</strong><span>{song.artist} · Single</span></div><button onClick={() => playSong(song)}><Play size={15} fill="currentColor" /></button><span>{song.duration}</span><MoreHorizontal size={18} /></div>) : <div className="empty-state"><span className="empty-icon"><SearchIcon size={18} /></span><strong>No music found</strong><span>Try a different song, artist, or mood.</span><button onClick={() => setSearch("")}>Clear search</button></div>}</div></MusicSection> : <><MusicSection title="Recent searches" link="Clear"><div className="search-chips"><button>Late night drive <Clock3 size={14} /></button><button>RÜFÜS DU SOL <Clock3 size={14} /></button><button>Focus <Clock3 size={14} /></button></div></MusicSection><MusicSection title="Trending searches" link=""><div className="trending-grid"><span><b>01</b> Sabrina Carpenter</span><span><b>02</b> Fred again..</span><span><b>03</b> Charli xcx</span><span><b>04</b> New music friday</span></div></MusicSection><MusicSection title="Browse all" link=""><div className="browse-grid"><div>Pop <span>↗</span></div><div>Electronic <span>↗</span></div><div>Hip-hop <span>↗</span></div><div>R&B <span>↗</span></div></div></MusicSection></>}</div>;
}

function LibraryView({ liked, setShowPlayer, playSong }: { liked: boolean; setShowPlayer: (v: boolean) => void; playSong: (song: Song) => void }) {
  return <div className="page library-page"><section className="library-hero"><div className="library-spark"><Heart size={35} fill="currentColor" /></div><div><p className="overline">YOUR COLLECTION</p><h1>Your Library</h1><p>{liked ? "1 liked song" : "0 liked songs"} · 4 playlists · 28 albums</p></div></section><div className="library-tabs"><button className="selected">Overview</button><button>Playlists</button><button>Albums</button><button>Artists</button></div><MusicSection title="Jump back in" link=""><div className="library-grid"><div className="library-card liked-card" onClick={() => { playSong(songs[0]); setShowPlayer(true); }}><div><Heart size={18} fill="currentColor" /><strong>Liked Songs</strong><span>{liked ? "1 song" : "0 songs"}</span></div><PlayButton /></div><div className="library-card"><Artwork src={covers.coast} /><strong>Late Night Drive</strong><span>32 songs</span></div><div className="library-card"><Artwork src={covers.blue} /><strong>Soft Focus</strong><span>48 songs</span></div></div></MusicSection><MusicSection title="Recently added" link="See all"><div className="recent-grid">{songs.slice(0, 4).map((song) => <RecentRow key={song.title} song={song} onPlay={() => playSong(song)} />)}</div></MusicSection></div>;
}

function DiscoverView({ playSong }: { playSong: (song: Song) => void }) { return <div className="page discover-page"><div className="discover-heading"><p className="overline accent-text">THE VIBRA EDIT</p><h1>Discover something<br /><em>new.</em></h1><p>Hand-picked sounds from the edges of your taste.</p></div><div className="discover-feature"><Artwork src={covers.desert} /><div><span className="overline">ALBUM OF THE WEEK</span><h2>Blue Hour</h2><p>Jónsi · Ambient / Experimental</p><button className="hero-button" onClick={() => playSong(songs[4])}>Listen now <Play size={14} fill="currentColor" /></button></div></div><MusicSection title="Fresh sounds for you" link="See all"><div className="horizontal-cards">{songs.slice().reverse().map((song) => <AlbumCard key={song.title} song={song} onPlay={() => playSong(song)} onOpen={() => playSong(song)} />)}</div></MusicSection></div>; }

function SettingsView() { return <div className="page settings-page"><p className="overline accent-text">PREFERENCES</p><h1>Settings</h1><p className="subtle">Make VIBRA feel like yours.</p><div className="settings-list"><div><div><strong>Audio quality</strong><span>High · Wi-Fi & cellular</span></div><ChevronRight size={18} /></div><div><div><strong>Download over cellular</strong><span>Allow downloads when not on Wi-Fi</span></div><div className="toggle on"><span /></div></div><div><div><strong>Notifications</strong><span>New releases, mixes, and recommendations</span></div><div className="toggle on"><span /></div></div><div><div><strong>Crossfade</strong><span>Blend songs together</span></div><span className="setting-value">Off <ChevronRight size={18} /></span></div></div><button className="sign-out">Sign out</button></div>; }
