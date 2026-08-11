"use client";

import { useMemo, useState } from "react";
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
};

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
  { title: "Midnight City", artist: "M83", cover: covers.midnight, duration: "4:03" },
  { title: "The Color Violet", artist: "Tory Lanez", cover: covers.rose, duration: "3:46" },
  { title: "Innerbloom", artist: "RÜFÜS DU SOL", cover: covers.gold, duration: "9:35" },
  { title: "Sweet Disposition", artist: "The Temper Trap", cover: covers.blue, duration: "3:54" },
  { title: "Sunset Lover", artist: "Petit Biscuit", cover: covers.ocean, duration: "3:58" },
  { title: "After Dark", artist: "Mr.Kitty", cover: covers.face, duration: "4:17" },
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
  const [activeNav, setActiveNav] = useState("Home");
  const [playing, setPlaying] = useState(true);
  const [liked, setLiked] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSong, setSelectedSong] = useState(songs[0]);
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredSongs = useMemo(
    () => songs.filter((song) => `${song.title} ${song.artist}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const playSong = (song: Song) => {
    setSelectedSong(song);
    setPlaying(true);
  };

  const navigate = (label: string) => {
    setActiveNav(label);
    setShowPlayer(false);
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
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark"><span /></span>VIBRA</div>
          <div className="breadcrumbs"><span>Music</span><ChevronRight size={14} /><strong>{activeNav}</strong></div>
          <div className="top-actions">
            <button className="icon-button"><Bell size={18} /></button>
            <div className="top-profile"><div className="avatar avatar-small">AM</div><ChevronDown size={14} /></div>
            <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={20} /></button>
          </div>
        </header>

        {activeNav === "Search" ? (
          <SearchView search={search} setSearch={setSearch} songs={filteredSongs} playSong={playSong} />
        ) : activeNav === "Your Library" || activeNav === "Playlists" ? (
          <LibraryView liked={liked} setShowPlayer={setShowPlayer} playSong={playSong} />
        ) : activeNav === "Settings" ? (
          <SettingsView />
        ) : activeNav === "Discover" ? (
          <DiscoverView playSong={playSong} />
        ) : (
          <HomeView playing={playing} setPlaying={setPlaying} liked={liked} setLiked={setLiked} playSong={playSong} setShowPlayer={setShowPlayer} />
        )}

        {!showPlayer && <MiniPlayer song={selectedSong} playing={playing} liked={liked} setLiked={setLiked} setPlaying={setPlaying} setShowPlayer={setShowPlayer} />}
        {showPlayer && <FullPlayer song={selectedSong} playing={playing} setPlaying={setPlaying} liked={liked} setLiked={setLiked} close={() => setShowPlayer(false)} />}
      </main>
      {menuOpen && <div className="mobile-nav-popover"><button onClick={() => { navigate("Home"); setMenuOpen(false); }}>Home</button><button onClick={() => { navigate("Search"); setMenuOpen(false); }}>Search</button><button onClick={() => { navigate("Your Library"); setMenuOpen(false); }}>Library</button><button onClick={() => { navigate("Settings"); setMenuOpen(false); }}>Settings</button></div>}
    </div>
  );
}

function HomeView({ playing, setPlaying, liked, setLiked, playSong, setShowPlayer }: { playing: boolean; setPlaying: (v: boolean) => void; liked: boolean; setLiked: (v: boolean) => void; playSong: (song: Song) => void; setShowPlayer: (v: boolean) => void }) {
  return (
    <div className="page home-page">
      <section className="welcome-row"><div><p className="overline">Tuesday, August 12</p><h1>Good evening, Alex <span>✦</span></h1><p className="subtle">A little music for wherever you are.</p></div><button className="listen-button" onClick={() => { playSong(songs[0]); setShowPlayer(true); }}><Play size={15} fill="currentColor" /> Start listening</button></section>
      <section className="hero-banner">
        <div className="hero-copy"><p className="overline accent-text">VIBRA ORIGINAL • DAILY MIX</p><h2>Your evening<br /><em>in stereo.</em></h2><p>Dreamy electronics, warm vocals, and slow-burn grooves curated for your night.</p><button className="hero-button" onClick={() => playSong(songs[0])}>Play mix <Play size={14} fill="currentColor" /></button><div className="hero-dots"><span className="selected" /><span /><span /><span /></div></div>
        <div className="hero-art"><Artwork src={covers.midnight} /><div className="hero-disc"><div>V</div></div><div className="floating-note note-one">♪</div><div className="floating-note note-two">♫</div></div>
      </section>
      <section className="mood-row"><div className="section-heading"><h2>How are you feeling?</h2><span>Pick a mood</span></div><div className="moods">{moods.map(([name, color]) => <button key={name} className="mood-pill" style={{ "--mood": color } as React.CSSProperties}><span className="mood-icon">{name === "Chill" ? "◒" : name === "Focus" ? "◐" : name === "Workout" ? "↗" : name === "Party" ? "✦" : "☾"}</span>{name}</button>)}</div></section>
      <MusicSection title="Made for you" link="See all"><div className="horizontal-cards">{songs.slice(0, 5).map((song, i) => <AlbumCard key={song.title} song={song} tag={i === 0 ? "For your night" : undefined} onPlay={() => { playSong(song); setPlaying(true); }} onOpen={() => setShowPlayer(true)} />)}</div></MusicSection>
      <MusicSection title="Recently played" link="View history"><div className="recent-grid">{songs.slice(1, 5).map((song) => <RecentRow key={song.title} song={song} onPlay={() => { playSong(song); setPlaying(true); }} />)}</div></MusicSection>
      <MusicSection title="Trending now" link="See all"><div className="horizontal-cards">{songs.slice(2).concat(songs.slice(0, 1)).map((song) => <AlbumCard key={`trend-${song.title}`} song={song} onPlay={() => { playSong(song); setPlaying(true); }} onOpen={() => setShowPlayer(true)} />)}</div></MusicSection>
      <section className="split-sections"><MusicSection title="Popular playlists" link="Explore"><div className="playlist-list"><PlaylistItem title="Late Night Drive" subtitle="VIBRA · 32 songs" cover={covers.coast} /><PlaylistItem title="Soft Focus" subtitle="VIBRA · 48 songs" cover={covers.blue} /></div></MusicSection><MusicSection title="Daily mixes" link="Refresh"><div className="mix-list"><div className="mix-card mix-purple"><span>Mix 01</span><strong>Made for<br />your mood</strong><PlayButton small onClick={() => setPlaying(!playing)} /></div><div className="mix-card mix-orange"><span>Mix 02</span><strong>Fresh<br />discoveries</strong><PlayButton small onClick={() => setPlaying(!playing)} /></div></div></MusicSection></section>
      <MusicSection title="Recommended artists" link="See all"><div className="artist-row"><Artist name="Maggie Rogers" image={covers.face} /><Artist name="Bonobo" image={covers.ocean} /><Artist name="Lana Del Rey" image={covers.rose} /><Artist name="Jamie xx" image={covers.desert} /><Artist name="Nujabes" image={covers.midnight} /></div></MusicSection>
      <div className="bottom-space" />
    </div>
  );
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

function MiniPlayer({ song, playing, liked, setLiked, setPlaying, setShowPlayer }: { song: Song; playing: boolean; liked: boolean; setLiked: (v: boolean) => void; setPlaying: (v: boolean) => void; setShowPlayer: (v: boolean) => void }) {
  return <div className="mini-player"><div className="mini-song" onClick={() => setShowPlayer(true)}><Artwork src={song.cover} className="mini-art" /><div><strong>{song.title}</strong><span>{song.artist}</span></div></div><div className="mini-controls"><button onClick={() => setPlaying(!playing)} className="mini-main">{playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}</button><button><SkipForward size={17} /></button></div><div className="mini-progress"><span /><i /></div><button className={`mini-heart ${liked ? "liked" : ""}`} onClick={() => setLiked(!liked)}><Heart size={18} fill={liked ? "currentColor" : "none"} /></button><button className="queue-button" onClick={() => setShowPlayer(true)}><ListMusic size={18} /></button></div>;
}

function FullPlayer({ song, playing, setPlaying, liked, setLiked, close }: { song: Song; playing: boolean; setPlaying: (v: boolean) => void; liked: boolean; setLiked: (v: boolean) => void; close: () => void }) {
  return <div className="full-player"><div className="player-top"><button onClick={close} className="back-button"><ArrowLeft size={20} /><span>Back to browsing</span></button><span>NOW PLAYING</span><button className="icon-button"><MoreHorizontal size={20} /></button></div><div className="player-body"><div className="player-art-wrap"><Artwork src={song.cover} className="player-art" /><div className="player-glow" /></div><div className="player-details"><div className="player-label">PLAYING FROM <span>Evening Mix</span></div><h1>{song.title}</h1><h3>{song.artist}</h3><div className="player-progress"><div className="progress-line"><span /></div><div><span>1:24</span><span>{song.duration}</span></div></div><div className="player-controls"><button><Shuffle size={20} /></button><button><SkipBack size={25} fill="currentColor" /></button><button className="player-play" onClick={() => setPlaying(!playing)}>{playing ? <Pause size={25} fill="currentColor" /> : <Play size={25} fill="currentColor" />}</button><button><SkipForward size={25} fill="currentColor" /></button><button><Repeat2 size={20} /></button></div><div className="player-actions"><button className={liked ? "liked" : ""} onClick={() => setLiked(!liked)}><Heart size={19} fill={liked ? "currentColor" : "none"} /> Favorite</button><button><Plus size={19} /> Add to playlist</button><button><Share2 size={18} /> Share</button><button><Mic2 size={18} /> Lyrics</button><button><Clock3 size={18} /> Sleep timer</button></div></div></div><div className="queue-panel"><div><span className="overline">UP NEXT</span><h3>Queue <span>12 songs</span></h3></div><button>View queue <ChevronRight size={15} /></button><div className="queue-track"><Artwork src={covers.rose} className="queue-art" /><div><strong>The Color Violet</strong><span>Tory Lanez</span></div><span>3:46</span></div><div className="queue-track"><Artwork src={covers.gold} className="queue-art" /><div><strong>Innerbloom</strong><span>RÜFÜS DU SOL</span></div><span>9:35</span></div></div></div>;
}

function SearchView({ search, setSearch, songs, playSong }: { search: string; setSearch: (v: string) => void; songs: Song[]; playSong: (song: Song) => void }) {
  return <div className="page search-page"><div className="search-intro"><p className="overline accent-text">FIND YOUR FREQUENCY</p><h1>What are you<br /><em>in the mood for?</em></h1><div className="search-input"><SearchIcon size={21} /><input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search songs, artists, albums..." />{search && <button onClick={() => setSearch("")}><X size={18} /></button>}<span>⌘ K</span></div></div>{search ? <MusicSection title={`Results for “${search}”`} link=""><div className="search-results">{songs.length ? songs.map((song, i) => <div className="result-row" key={song.title}><span className="result-number">0{i + 1}</span><Artwork src={song.cover} className="result-art" /><div><strong>{song.title}</strong><span>{song.artist} · Single</span></div><button onClick={() => playSong(song)}><Play size={15} fill="currentColor" /></button><span>{song.duration}</span><MoreHorizontal size={18} /></div>) : <div className="empty-state">No music found. Try another search.</div>}</div></MusicSection> : <><MusicSection title="Recent searches" link="Clear"><div className="search-chips"><button>Late night drive <Clock3 size={14} /></button><button>RÜFÜS DU SOL <Clock3 size={14} /></button><button>Focus <Clock3 size={14} /></button></div></MusicSection><MusicSection title="Trending searches" link=""><div className="trending-grid"><span><b>01</b> Sabrina Carpenter</span><span><b>02</b> Fred again..</span><span><b>03</b> Charli xcx</span><span><b>04</b> New music friday</span></div></MusicSection><MusicSection title="Browse all" link=""><div className="browse-grid"><div>Pop <span>↗</span></div><div>Electronic <span>↗</span></div><div>Hip-hop <span>↗</span></div><div>R&B <span>↗</span></div></div></MusicSection></>}</div>;
}

function LibraryView({ liked, setShowPlayer, playSong }: { liked: boolean; setShowPlayer: (v: boolean) => void; playSong: (song: Song) => void }) {
  return <div className="page library-page"><section className="library-hero"><div className="library-spark"><Heart size={35} fill="currentColor" /></div><div><p className="overline">YOUR COLLECTION</p><h1>Your Library</h1><p>{liked ? "1 liked song" : "0 liked songs"} · 4 playlists · 28 albums</p></div></section><div className="library-tabs"><button className="selected">Overview</button><button>Playlists</button><button>Albums</button><button>Artists</button></div><MusicSection title="Jump back in" link=""><div className="library-grid"><div className="library-card liked-card" onClick={() => { playSong(songs[0]); setShowPlayer(true); }}><div><Heart size={18} fill="currentColor" /><strong>Liked Songs</strong><span>{liked ? "1 song" : "0 songs"}</span></div><PlayButton /></div><div className="library-card"><Artwork src={covers.coast} /><strong>Late Night Drive</strong><span>32 songs</span></div><div className="library-card"><Artwork src={covers.blue} /><strong>Soft Focus</strong><span>48 songs</span></div></div></MusicSection><MusicSection title="Recently added" link="See all"><div className="recent-grid">{songs.slice(0, 4).map((song) => <RecentRow key={song.title} song={song} onPlay={() => playSong(song)} />)}</div></MusicSection></div>;
}

function DiscoverView({ playSong }: { playSong: (song: Song) => void }) { return <div className="page discover-page"><div className="discover-heading"><p className="overline accent-text">THE VIBRA EDIT</p><h1>Discover something<br /><em>new.</em></h1><p>Hand-picked sounds from the edges of your taste.</p></div><div className="discover-feature"><Artwork src={covers.desert} /><div><span className="overline">ALBUM OF THE WEEK</span><h2>Blue Hour</h2><p>Jónsi · Ambient / Experimental</p><button className="hero-button" onClick={() => playSong(songs[4])}>Listen now <Play size={14} fill="currentColor" /></button></div></div><MusicSection title="Fresh sounds for you" link="See all"><div className="horizontal-cards">{songs.slice().reverse().map((song) => <AlbumCard key={song.title} song={song} onPlay={() => playSong(song)} onOpen={() => playSong(song)} />)}</div></MusicSection></div>; }

function SettingsView() { return <div className="page settings-page"><p className="overline accent-text">PREFERENCES</p><h1>Settings</h1><p className="subtle">Make VIBRA feel like yours.</p><div className="settings-list"><div><div><strong>Audio quality</strong><span>High · Wi-Fi & cellular</span></div><ChevronRight size={18} /></div><div><div><strong>Download over cellular</strong><span>Allow downloads when not on Wi-Fi</span></div><div className="toggle on"><span /></div></div><div><div><strong>Notifications</strong><span>New releases, mixes, and recommendations</span></div><div className="toggle on"><span /></div></div><div><div><strong>Crossfade</strong><span>Blend songs together</span></div><span className="setting-value">Off <ChevronRight size={18} /></span></div></div><button className="sign-out">Sign out</button></div>; }
