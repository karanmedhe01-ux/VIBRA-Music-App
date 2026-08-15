"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  duration?: string;
  youtubeVideoId: string;
  youtubeKind: "video" | "channel" | "playlist";
};

const covers = {
  midnight:
    "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85",
  rose: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=700&q=85",
  gold: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=85",
  blue: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=700&q=85",
  ocean:
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=700&q=85",
  face: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85",
  desert:
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=700&q=85",
  coast:
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=700&q=85",
};

const songs: Song[] = [
  {
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    cover: covers.midnight,
    duration: "4:22",
    youtubeVideoId: "Umqb9KENgmk",
    youtubeKind: "video",
  },
  {
    title: "Kesariya",
    artist: "Arijit Singh",
    cover: covers.rose,
    duration: "4:28",
    youtubeVideoId: "BddP6PYo2gs",
    youtubeKind: "video",
  },
  {
    title: "Raataan Lambiyan",
    artist: "Jubin Nautiyal",
    cover: covers.blue,
    duration: "3:52",
    youtubeVideoId: "TV2GJrHbU6M",
    youtubeKind: "video",
  },
  {
    title: "Believer",
    artist: "Imagine Dragons",
    cover: covers.gold,
    duration: "3:24",
    youtubeVideoId: "W2TE0DjdNqI",
    youtubeKind: "video",
  },
  {
    title: "Levitating",
    artist: "Dua Lipa",
    cover: covers.ocean,
    duration: "3:23",
    youtubeVideoId: "TUVcZfQe-Kw",
    youtubeKind: "video",
  },
];
const navItems = [
  { label: "Home", icon: HomeIcon },
  { label: "Discover", icon: Compass },
  { label: "Search", icon: SearchIcon },
  { label: "Your Library", icon: Album },
];

const bottomTabs = [
  { label: "Home", icon: HomeIcon },
  { label: "Search", icon: SearchIcon },
  { label: "Library", icon: Album },
  { label: "Player", icon: Radio },
  { label: "Profile", icon: UserRound },
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

function PlayButton({
  onClick,
  small = false,
}: {
  onClick?: () => void;
  small?: boolean;
}) {
  return (
    <button
      aria-label="Play"
      onClick={onClick}
      className={`play-button ${small ? "play-button-small" : ""}`}
    >
      <Play size={small ? 14 : 17} fill="currentColor" strokeWidth={0} />
    </button>
  );
}

export default function Home() {
  const youtubeCommandRef = useRef<
    ((command: string, args?: unknown[]) => void) | null
  >(null);
  const [activeNav, setActiveNav] = useState("Home");
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [library, setLibrary] = useState<Song[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [backToastVisible, setBackToastVisible] = useState(false);
  const navigationStackRef = useRef<string[]>(["Home"]);
  const backArmedRef = useRef(false);
  const backTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackTapRef = useRef(0);

  const startSong = useCallback(
    (song: Song, autoplay = true) => {
      setSelectedSong(song);
      setQueue((currentQueue) =>
        currentQueue.some((item) => item.youtubeVideoId === song.youtubeVideoId)
          ? currentQueue
          : [...currentQueue, song],
      );
      setCurrentTime(0);
      setDurationSeconds(0);
      setPlaybackError(null);
      setIsLoading(true);
      setPlaying(autoplay);
      setShowPlayer(true);
      const songIndex = queue.findIndex(
        (item) => item.youtubeVideoId === song.youtubeVideoId,
      );
      setQueueIndex(songIndex >= 0 ? songIndex : 0);
    },
    [queue],
  );

  const togglePlayback = useCallback(() => {
    const now = Date.now();
    if (now - playbackTapRef.current < 280) return;
    playbackTapRef.current = now;
    if (!selectedSong) {
      setPlaybackError("Search for a song to start playback.");
      return;
    }
    youtubeCommandRef.current?.(playing ? "pauseVideo" : "playVideo");
  }, [playing, selectedSong]);

  const playSong = useCallback((song: Song) => startSong(song), [startSong]);
  const nextSong = useCallback(() => {
    if (!queue.length) {
      setPlaybackError("Your queue is empty. Search for a song to continue.");
      return;
    }
    const nextIndex = (queueIndex + 1) % queue.length;
    startSong(queue[nextIndex]);
  }, [queue, queueIndex, startSong]);
  const previousSong = useCallback(() => {
    if (currentTime > 3) {
      youtubeCommandRef.current?.("seekTo", [0, true]);
      setCurrentTime(0);
      return;
    }
    if (!queue.length) return;
    const previousIndex = (queueIndex - 1 + queue.length) % queue.length;
    startSong(queue[previousIndex]);
  }, [currentTime, queue, queueIndex, startSong]);
  const seek = (nextTime: number) => {
    youtubeCommandRef.current?.("seekTo", [nextTime, true]);
    setCurrentTime(nextTime);
  };
  const setYoutubeCommand = (
    command: ((name: string, args?: unknown[]) => void) | null,
  ) => {
    youtubeCommandRef.current = command;
  };
  const addToLibrary = (song: Song) => {
    setLibrary((current) =>
      current.some((item) => item.youtubeVideoId === song.youtubeVideoId)
        ? current
        : [...current, song]
    );
  };

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

  const navigate = (label: string) => {
    if (label === activeNav) {
      setMenuOpen(false);
      return;
    }
    navigationStackRef.current =
      label === "Home" ? ["Home"] : [...navigationStackRef.current, label];
    setActiveNav(label);
    setShowPlayer(false);
    setMenuOpen(false);
    window.history.pushState(
      { vibra: true, screen: label },
      "",
      window.location.href,
    );
  };

  const activeTab = showPlayer
    ? "Player"
    : activeNav === "Search"
      ? "Search"
      : activeNav === "Your Library" || activeNav === "Playlists"
        ? "Library"
        : activeNav === "Profile" || activeNav === "Settings"
          ? "Profile"
          : "Home";
  const selectBottomTab = (tab: string) => {
    if (tab === "Player") {
      setShowPlayer(true);
      setMenuOpen(false);
      return;
    }
    navigate(tab === "Library" ? "Your Library" : tab);
  };

  return (
    <div className="vibra-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <span />
          </span>
          <span>VIBRA</span>
        </div>
        <div className="sidebar-section">
          <p className="eyebrow">Menu</p>
          <nav>
            {navItems.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => navigate(label)}
                className={`nav-item ${activeNav === label ? "active" : ""}`}
              >
                <Icon size={18} strokeWidth={activeNav === label ? 2.4 : 1.8} />
                <span>{label}</span>
                {label === "Search" && <span className="shortcut">⌘ K</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="sidebar-section collection-section">
          <p className="eyebrow">Your Collection</p>
          <button className="nav-item" onClick={() => navigate("Your Library")}>
            <Heart size={18} />
            <span>Liked Songs</span>
          </button>
          <button className="nav-item" onClick={() => navigate("Playlists")}>
            <ListMusic size={18} />
            <span>Playlists</span>
          </button>
          <button className="nav-item" onClick={() => navigate("Your Library")}>
            <Clock3 size={18} />
            <span>Recently Played</span>
          </button>
        </div>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => navigate("Settings")}>
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <div className="upgrade-card">
            <Sparkles size={18} />
            <strong>Go Premium</strong>
            <span>Unlock your listening</span>
            <button>
              Upgrade now <ChevronRight size={13} />
            </button>
          </div>
          <div className="profile-row">
            <div className="avatar">AL</div>
            <div>
              <strong>Alex Morgan</strong>
              <span>VIBRA member</span>
            </div>
            <MoreHorizontal size={18} />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">
              <span />
            </span>
            VIBRA
          </div>
          <div className="breadcrumbs">
            <span>Music</span>
            <ChevronRight size={14} />
            <strong>{activeNav}</strong>
          </div>
          <div className="top-actions">
            <button className="icon-button">
              <Bell size={18} />
            </button>
            <div className="top-profile">
              <div className="avatar avatar-small">AM</div>
              <ChevronDown size={14} />
            </div>
            <button
              className="mobile-menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        <div
          className="screen-stage"
          key={`${activeNav}-${showPlayer ? "player" : "browse"}`}
        >
          {activeNav === "Search" ? (
            <SearchView
              search={search}
              setSearch={setSearch}
              playSong={playSong}
              addToLibrary={addToLibrary}
            />
          ) : activeNav === "Your Library" || activeNav === "Playlists" ? (
            <LibraryView
              liked={liked}
              setShowPlayer={setShowPlayer}
              playSong={playSong}
              library={library}
            />
          ) : activeNav === "Settings" ? (
            <SettingsView />
          ) : activeNav === "Profile" ? (
            <ProfileView navigate={navigate} />
          ) : activeNav === "Discover" ? (
            <DiscoverView playSong={playSong} />
          ) : (
            <HomeView
              playing={playing}
              setPlaying={setPlaying}
              liked={liked}
              setLiked={setLiked}
              playSong={playSong}
              setShowPlayer={setShowPlayer}
            />
          )}
        </div>

        {!showPlayer && selectedSong && (
          <MiniPlayer
            song={selectedSong}
            playing={playing}
            liked={liked}
            setLiked={setLiked}
            togglePlayback={togglePlayback}
            setShowPlayer={setShowPlayer}
            currentTime={currentTime}
            durationSeconds={durationSeconds}
            isLoading={isLoading}
            playbackError={playbackError}
            nextSong={nextSong}
          />
        )}
        {showPlayer && selectedSong && (
          <FullPlayer
            song={selectedSong}
            playing={playing}
            togglePlayback={togglePlayback}
            liked={liked}
            setLiked={setLiked}
            close={() => setShowPlayer(false)}
            currentTime={currentTime}
            durationSeconds={durationSeconds}
            seek={seek}
            previousSong={previousSong}
            nextSong={nextSong}
            volume={volume}
            setVolume={setVolume}
            isLoading={isLoading}
            playbackError={playbackError}
            queue={queue}
            setQueue={setQueue}
            playSong={playSong}
            setYoutubeCommand={setYoutubeCommand}
            setPlaying={setPlaying}
            setLoading={setIsLoading}
            setProgress={setCurrentTime}
            setDuration={setDurationSeconds}
          />
        )}
      </main>
      <nav className="bottom-nav" aria-label="Primary navigation">
        {bottomTabs.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => selectBottomTab(label)}
            className={activeTab === label ? "active" : ""}
            aria-current={activeTab === label ? "page" : undefined}
          >
            <span className="bottom-nav-icon">
              <Icon size={18} strokeWidth={activeTab === label ? 2.4 : 1.8} />
              {label === "Player" && playing && <i />}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {menuOpen && (
        <div className="mobile-nav-popover">
          <button
            onClick={() => {
              navigate("Home");
              setMenuOpen(false);
            }}
          >
            Home
          </button>
          <button
            onClick={() => {
              navigate("Search");
              setMenuOpen(false);
            }}
          >
            Search
          </button>
          <button
            onClick={() => {
              navigate("Your Library");
              setMenuOpen(false);
            }}
          >
            Library
          </button>
          <button
            onClick={() => {
              navigate("Settings");
              setMenuOpen(false);
            }}
          >
            Settings
          </button>
        </div>
      )}
      {backToastVisible && (
        <div className="vibra-toast" role="status" aria-live="polite">
          <span className="toast-dot" />
          <span>Press back again to exit</span>
          <i />
        </div>
      )}
    </div>
  );
}

function HomeView({
  playing,
  setPlaying,
  liked,
  setLiked,
  playSong,
  setShowPlayer,
}: {
  playing: boolean;
  setPlaying: (v: boolean) => void;
  liked: boolean;
  setLiked: (v: boolean) => void;
  playSong: (song: Song) => void;
  setShowPlayer: (v: boolean) => void;
}) {
  return (
    <div className="page home-page">
      <section className="welcome-row">
        <div>
          <p className="overline">Tuesday, August 12</p>
          <h1>
            Good evening, Alex <span>✦</span>
          </h1>
          <p className="subtle">A little music for wherever you are.</p>
        </div>
        <button
          className="listen-button"
          onClick={() => {
            playSong(songs[0]);
            setShowPlayer(true);
          }}
        >
          <Play size={15} fill="currentColor" /> Start listening
        </button>
      </section>
      <section className="hero-banner">
        <div className="hero-copy">
          <p className="overline accent-text">VIBRA ORIGINAL • DAILY MIX</p>
          <h2>
            Your evening
            <br />
            <em>in stereo.</em>
          </h2>
          <p>
            Dreamy electronics, warm vocals, and slow-burn grooves curated for
            your night.
          </p>
          <button className="hero-button" onClick={() => playSong(songs[0])}>
            Play mix <Play size={14} fill="currentColor" />
          </button>
          <div className="hero-dots">
            <span className="selected" />
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="hero-art">
          <Artwork src={covers.midnight} />
          <div className="hero-disc">
            <div>V</div>
          </div>
          <div className="floating-note note-one">♪</div>
          <div className="floating-note note-two">♫</div>
        </div>
      </section>
      <section className="mood-row">
        <div className="section-heading">
          <h2>How are you feeling?</h2>
          <span>Pick a mood</span>
        </div>
        <div className="moods">
          {moods.map(([name, color]) => (
            <button
              key={name}
              className="mood-pill"
              style={{ "--mood": color } as React.CSSProperties}
            >
              <span className="mood-icon">
                {name === "Chill"
                  ? "◒"
                  : name === "Focus"
                    ? "◐"
                    : name === "Workout"
                      ? "↗"
                      : name === "Party"
                        ? "✦"
                        : "☾"}
              </span>
              {name}
            </button>
          ))}
        </div>
      </section>
      <MusicSection title="Made for you" link="See all">
        <div className="horizontal-cards">
          {songs.slice(0, 5).map((song, i) => (
            <AlbumCard
              key={song.title}
              song={song}
              tag={i === 0 ? "For your night" : undefined}
              onPlay={() => {
                playSong(song);
                setPlaying(true);
              }}
              onOpen={() => setShowPlayer(true)}
            />
          ))}
        </div>
      </MusicSection>
      <MusicSection title="Recently played" link="View history">
        <div className="recent-grid">
          {songs.slice(1, 5).map((song) => (
            <RecentRow
              key={song.title}
              song={song}
              onPlay={() => {
                playSong(song);
                setPlaying(true);
              }}
            />
          ))}
        </div>
      </MusicSection>
      <MusicSection title="Trending now" link="See all">
        <div className="horizontal-cards">
          {songs
            .slice(2)
            .concat(songs.slice(0, 1))
            .map((song) => (
              <AlbumCard
                key={`trend-${song.title}`}
                song={song}
                onPlay={() => {
                  playSong(song);
                  setPlaying(true);
                }}
                onOpen={() => setShowPlayer(true)}
              />
            ))}
        </div>
      </MusicSection>
      <section className="split-sections">
        <MusicSection title="Popular playlists" link="Explore">
          <div className="playlist-list">
            <PlaylistItem
              title="Late Night Drive"
              subtitle="VIBRA · 32 songs"
              cover={covers.coast}
            />
            <PlaylistItem
              title="Soft Focus"
              subtitle="VIBRA · 48 songs"
              cover={covers.blue}
            />
          </div>
        </MusicSection>
        <MusicSection title="Daily mixes" link="Refresh">
          <div className="mix-list">
            <div className="mix-card mix-purple">
              <span>Mix 01</span>
              <strong>
                Made for
                <br />
                your mood
              </strong>
              <PlayButton small onClick={() => setPlaying(!playing)} />
            </div>
            <div className="mix-card mix-orange">
              <span>Mix 02</span>
              <strong>
                Fresh
                <br />
                discoveries
              </strong>
              <PlayButton small onClick={() => setPlaying(!playing)} />
            </div>
          </div>
        </MusicSection>
      </section>
      <MusicSection title="Recommended artists" link="See all">
        <div className="artist-row">
          <Artist name="Maggie Rogers" image={covers.face} />
          <Artist name="Bonobo" image={covers.ocean} />
          <Artist name="Lana Del Rey" image={covers.rose} />
          <Artist name="Jamie xx" image={covers.desert} />
          <Artist name="Nujabes" image={covers.midnight} />
        </div>
      </MusicSection>
      <div className="bottom-space" />
    </div>
  );
}

function MusicSection({
  title,
  link,
  children,
}: {
  title: string;
  link: string;
  children: React.ReactNode;
}) {
  return (
    <section className="music-section">
      <div className="section-heading">
        <h2>{title}</h2>
        <button>
          {link} <ChevronRight size={15} />
        </button>
      </div>
      {children}
    </section>
  );
}

function AlbumCard({
  song,
  tag,
  onPlay,
  onOpen,
}: {
  song: Song;
  tag?: string;
  onPlay: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="album-card">
      <div className="album-cover-wrap" onClick={onOpen}>
        <Artwork src={song.cover} />
        <button
          className="cover-play"
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
        >
          <Play size={17} fill="currentColor" />
        </button>
        {tag && <span className="cover-tag">{tag}</span>}
      </div>
      <div className="card-title">{song.title}</div>
      <div className="card-artist">{song.artist}</div>
    </article>
  );
}

function RecentRow({ song, onPlay }: { song: Song; onPlay: () => void }) {
  return (
    <div className="recent-row">
      <Artwork src={song.cover} className="recent-art" />
      <div className="recent-info">
        <strong>{song.title}</strong>
        <span>{song.artist}</span>
      </div>
      <button className="row-play" onClick={onPlay}>
        <Play size={15} fill="currentColor" />
      </button>
      <span className="duration">{song.duration}</span>
      <button className="more-button">
        <Ellipsis size={18} />
      </button>
    </div>
  );
}

function PlaylistItem({
  title,
  subtitle,
  cover,
}: {
  title: string;
  subtitle: string;
  cover: string;
}) {
  return (
    <div className="playlist-item">
      <Artwork src={cover} className="playlist-art" />
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <MoreHorizontal size={18} />
    </div>
  );
}
function Artist({ name, image }: { name: string; image: string }) {
  return (
    <div className="artist">
      <Artwork src={image} className="artist-art" />
      <strong>{name}</strong>
      <span>Artist</span>
    </div>
  );
}

function MiniPlayer({
  song,
  playing,
  liked,
  setLiked,
  togglePlayback,
  setShowPlayer,
  currentTime,
  durationSeconds,
  isLoading,
  playbackError,
  nextSong,
}: {
  song: Song;
  playing: boolean;
  liked: boolean;
  setLiked: (v: boolean) => void;
  togglePlayback: () => void;
  setShowPlayer: (v: boolean) => void;
  currentTime: number;
  durationSeconds: number;
  isLoading: boolean;
  playbackError: string | null;
  nextSong: () => void;
}) {
  const progress = durationSeconds
    ? `${Math.min(100, (currentTime / durationSeconds) * 100)}%`
    : "0%";
  return (
    <div className="mini-player">
      <div className="mini-song" onClick={() => setShowPlayer(true)}>
        <Artwork src={song.cover} className="mini-art" />
        <div>
          <strong>{song.title}</strong>
          <span>{song.artist}</span>
        </div>
      </div>
      <div className="mini-controls">
        <button
          onClick={togglePlayback}
          className="mini-main"
          aria-label={playing ? "Pause" : "Play"}
        >
          {isLoading ? (
            <span className="spinner" />
          ) : playing ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
        </button>
        <button onClick={nextSong} aria-label="Next track">
          <SkipForward size={17} />
        </button>
      </div>
      <div
        className={`mini-progress ${playbackError ? "has-error" : ""}`}
        title={playbackError ?? (playing ? "Playing" : "Paused")}
      >
        <span style={{ width: progress }} />
        <i style={{ left: progress }} />
      </div>
      <button
        className={`mini-heart ${liked ? "liked" : ""}`}
        onClick={() => setLiked(!liked)}
      >
        <Heart size={18} fill={liked ? "currentColor" : "none"} />
      </button>
      <button className="queue-button" onClick={() => setShowPlayer(true)}>
        <ListMusic size={18} />
      </button>
    </div>
  );
}

function FullPlayer({
  song,
  playing,
  togglePlayback,
  liked,
  setLiked,
  close,
  currentTime,
  durationSeconds,
  seek,
  previousSong,
  nextSong,
  volume,
  setVolume,
  isLoading,
  playbackError,
  queue,
  setQueue,
  playSong,
  setYoutubeCommand,
  setPlaying,
  setLoading,
  setProgress,
  setDuration,
}: {
  song: Song;
  playing: boolean;
  togglePlayback: () => void;
  liked: boolean;
  setLiked: (v: boolean) => void;
  close: () => void;
  currentTime: number;
  durationSeconds: number;
  seek: (value: number) => void;
  previousSong: () => void;
  nextSong: () => void;
  volume: number;
  setVolume: (v: number) => void;
  isLoading: boolean;
  playbackError: string | null;
  queue: Song[];
  setQueue: (songs: Song[]) => void;
  playSong: (song: Song) => void;
  setYoutubeCommand: (
    command: ((name: string, args?: unknown[]) => void) | null,
  ) => void;
  setPlaying: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  setProgress: (v: number) => void;
  setDuration: (v: number) => void;
}) {
  const progress = durationSeconds
    ? Math.min(100, (currentTime / durationSeconds) * 100)
    : 0;
  const formatTime = (seconds: number) =>
    String(Math.floor(seconds / 60)) +
    ":" +
    String(Math.floor(seconds % 60)).padStart(2, "0");
  return (
    <div className="full-player">
      <div className="player-top">
        <button onClick={close} className="back-button">
          <ArrowLeft size={20} />
          <span>Back to browsing</span>
        </button>
        <span>NOW PLAYING</span>
        <button className="icon-button">
          <MoreHorizontal size={20} />
        </button>
      </div>
      <div className="player-body">
        <div className="player-art-wrap youtube-art-wrap">
          <YouTubePlayer
            videoId={song.youtubeVideoId}
            volume={volume}
            setCommand={setYoutubeCommand}
            setPlaying={setPlaying}
            setLoading={setLoading}
            setProgress={setProgress}
            setDuration={setDuration}
            onEnded={nextSong}
            onError={(message) => {
              setLoading(false);
              setPlaying(false);
            }}
          />
        </div>
        <div className="player-details">
          <div className="player-label">
            PLAYING FROM <span>YouTube Music</span>
          </div>
          <h1>{song.title}</h1>
          <h3>{song.artist}</h3>
          <div className="playback-status">
            {isLoading ? (
              "Loading official YouTube player..."
            ) : playbackError ? (
              <>
                <span>{playbackError}</span>
                <button onClick={togglePlayback}>Retry</button>
              </>
            ) : playing ? (
              "Now playing"
            ) : (
              "Paused"
            )}
          </div>
          <div className="player-progress">
            <div
              className="progress-line"
              style={{ "--progress": progress + "%" } as React.CSSProperties}
            >
              <input
                type="range"
                min="0"
                max={durationSeconds || 1}
                step="0.1"
                value={Math.min(currentTime, durationSeconds || 1)}
                onChange={(event) => seek(Number(event.target.value))}
                aria-label="Seek through song"
              />
            </div>
            <div>
              <span>{formatTime(currentTime)}</span>
              <span>{durationSeconds ? formatTime(durationSeconds) : "—"}</span>
            </div>
          </div>
          <div className="player-controls">
            <button aria-label="Shuffle">
              <Shuffle size={20} />
            </button>
            <button onClick={previousSong} aria-label="Previous track">
              <SkipBack size={25} fill="currentColor" />
            </button>
            <button
              className="player-play"
              onClick={togglePlayback}
              aria-label={playing ? "Pause" : "Play"}
            >
              {isLoading ? (
                <span className="spinner spinner-dark" />
              ) : playing ? (
                <Pause size={25} fill="currentColor" />
              ) : (
                <Play size={25} fill="currentColor" />
              )}
            </button>
            <button onClick={nextSong} aria-label="Next track">
              <SkipForward size={25} fill="currentColor" />
            </button>
            <button aria-label="Repeat">
              <Repeat2 size={20} />
            </button>
          </div>
          <div className="player-actions">
            <button
              className={liked ? "liked" : ""}
              onClick={() => setLiked(!liked)}
            >
              <Heart size={19} fill={liked ? "currentColor" : "none"} />{" "}
              Favorite
            </button>
            <button>
              <Plus size={19} /> Add to playlist
            </button>
            <button>
              <Share2 size={18} /> Share
            </button>
            <button>
              <Mic2 size={18} /> Official player
            </button>
            <button>
              <Clock3 size={18} /> Sleep timer
            </button>
          </div>
          <label className="player-volume">
            <Volume2 size={17} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              aria-label="Volume"
            />
          </label>
        </div>
      </div>
      <div className="queue-panel">
        <div>
          <span className="overline">UP NEXT</span>
          <h3>
            Queue <span>{queue.length} songs</span>
          </h3>
        </div>
        <button>
          View queue <ChevronRight size={15} />
        </button>
        {queue
          .filter((item) => item.youtubeVideoId !== song.youtubeVideoId)
          .slice(0, 4)
          .map((item) => (
            <button
              className="queue-track"
              key={item.youtubeVideoId}
              onClick={() => playSong(item)}
            >
              <Artwork src={item.cover} className="queue-art" />
              <div>
                <strong>{item.title}</strong>
                <span>{item.artist}</span>
              </div>
              <span>{item.duration ?? "YouTube"}</span>
            </button>
          ))}
        <button className="queue-add" onClick={() => setQueue([...queue])}>
          <Plus size={15} /> Queue is managed from Search
        </button>
      </div>
    </div>
  );
}

function YouTubePlayer({
  videoId,
  volume,
  setCommand,
  setPlaying,
  setLoading,
  setProgress,
  setDuration,
  onEnded,
  onError,
}: {
  videoId: string;
  volume: number;
  setCommand: (
    command: ((name: string, args?: unknown[]) => void) | null,
  ) => void;
  setPlaying: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  setProgress: (v: number) => void;
  setDuration: (v: number) => void;
  onEnded: () => void;
  onError: (message: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  useEffect(() => {
    const win = window as typeof window & {
      YT?: { Player: new (element: HTMLElement, options: any) => any };
      onYouTubeIframeAPIReady?: () => void;
    };
    let interval: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;
    const createPlayer = () => {
      if (cancelled || !hostRef.current || !win.YT?.Player) return;
      playerRef.current = new win.YT.Player(hostRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            setCommand((name, args = []) => {
              const method = playerRef.current?.[name];
              if (typeof method === "function")
                method.apply(playerRef.current, args);
            });
            playerRef.current?.setVolume?.(volume * 100);
            setDuration(playerRef.current?.getDuration?.() ?? 0);
            setLoading(false);
            interval = setInterval(() => {
              if (playerRef.current) {
                setProgress(playerRef.current.getCurrentTime?.() ?? 0);
                setDuration(playerRef.current.getDuration?.() ?? 0);
              }
            }, 500);
          },
          onStateChange: (event: { data: number }) => {
            if (event.data === 1) {
              setPlaying(true);
              setLoading(false);
            } else if (event.data === 2) setPlaying(false);
            else if (event.data === 3) setLoading(true);
            else if (event.data === 0) {
              setPlaying(false);
              onEnded();
            }
          },
          onError: (event: { data: number }) =>
            onError("YouTube player error (" + event.data + ")."),
        },
      });
    };
    if (win.YT?.Player) createPlayer();
    else {
      let script = document.querySelector<HTMLScriptElement>(
        "script[data-vibra-youtube]",
      );
      if (!script) {
        script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        script.dataset.vibraYoutube = "true";
        document.head.appendChild(script);
      }
      const previousReady = win.onYouTubeIframeAPIReady;
      win.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        createPlayer();
      };
    }
    return () => {
      cancelled = true;
      setCommand(null);
      if (interval) clearInterval(interval);
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [videoId]);
  useEffect(() => {
    playerRef.current?.setVolume?.(volume * 100);
  }, [volume]);
  return (
    <div
      ref={hostRef}
      className="youtube-player"
      aria-label="Official YouTube player"
    />
  );
  
