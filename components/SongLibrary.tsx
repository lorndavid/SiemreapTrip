"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import {
  ArrowLeft,
  Disc3,
  Music2,
  Pause,
  Play,
  Search,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { SongTrack } from "@/types/song";

type SongLibraryProps = {
  songs: SongTrack[];
};

type AppPalette = "man" | "woman" | "mix";
type AudioBehavior = "background" | "stop";
type ScrollMode = "smooth" | "auto";
type MotionMode = "dynamic" | "minimal";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function parsePalette(raw: string | null): AppPalette {
  if (raw === "man" || raw === "woman" || raw === "mix") {
    return raw;
  }
  return "mix";
}

function parseAudioBehavior(raw: string | null): AudioBehavior {
  if (raw === "background" || raw === "stop") {
    return raw;
  }
  return "stop";
}

function parseScrollMode(raw: string | null): ScrollMode {
  if (raw === "smooth" || raw === "auto") {
    return raw;
  }
  return "smooth";
}

function parseMotionMode(raw: string | null): MotionMode {
  if (raw === "dynamic" || raw === "minimal") {
    return raw;
  }
  return "dynamic";
}

export default function SongLibrary({ songs }: SongLibraryProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [appPalette, setAppPalette] = useState<AppPalette>("mix");
  const [audioBehavior, setAudioBehavior] = useState<AudioBehavior>("stop");
  const [scrollMode, setScrollMode] = useState<ScrollMode>("smooth");
  const [motionMode, setMotionMode] = useState<MotionMode>("dynamic");
  const [query, setQuery] = useState("");
  const [selectedSongId, setSelectedSongId] = useState<string | null>(songs[0]?.id ?? null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const filteredSongs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return songs;
    }

    return songs.filter((song) => song.title.toLowerCase().includes(normalized));
  }, [query, songs]);

  const activeSong =
    songs.find((song) => song.id === selectedSongId) ??
    songs[0] ??
    null;

  const activeIndex = activeSong
    ? songs.findIndex((song) => song.id === activeSong.id)
    : -1;
  const paletteClass =
    appPalette === "man"
      ? "palette-man"
      : appPalette === "woman"
        ? "palette-woman"
        : "palette-mix";

  useEffect(() => {
    const storedPalette = parsePalette(window.localStorage.getItem("sr_app_palette"));
    const storedAudioBehavior = parseAudioBehavior(window.localStorage.getItem("sr_audio_behavior"));
    const storedScrollMode = parseScrollMode(window.localStorage.getItem("sr_scroll_mode"));
    const storedMotionMode = parseMotionMode(window.localStorage.getItem("sr_motion_mode"));

    queueMicrotask(() => {
      setAppPalette(storedPalette);
      setAudioBehavior(storedAudioBehavior);
      setScrollMode(storedScrollMode);
      setMotionMode(storedMotionMode);
    });
  }, []);

  useEffect(() => {
    if (!activeSong || !audioRef.current) {
      return;
    }

    const audio = audioRef.current;
    audio.src = activeSong.src;
    audio.load();
    audio.currentTime = 0;

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [activeSong, isPlaying]);

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    if (motionMode === "minimal") {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-song-animate='hero']",
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
      );

      gsap.fromTo(
        "[data-song-animate='item']",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" },
      );
    }, rootRef);

    return () => ctx.revert();
  }, [filteredSongs.length, motionMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("mode-scroll-smooth", scrollMode === "smooth");
    root.classList.toggle("mode-scroll-auto", scrollMode === "auto");

    return () => {
      root.classList.remove("mode-scroll-smooth", "mode-scroll-auto");
    };
  }, [scrollMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("mode-motion-minimal", motionMode === "minimal");
    root.classList.toggle("mode-motion-dynamic", motionMode === "dynamic");

    return () => {
      root.classList.remove("mode-motion-minimal", "mode-motion-dynamic");
    };
  }, [motionMode]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden || audioBehavior === "background") {
        return;
      }
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    };

    const handlePageHide = () => {
      if (audioBehavior === "background") {
        return;
      }
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [audioBehavior]);

  const handleTogglePlay = async () => {
    if (!audioRef.current || !activeSong) {
      return;
    }

    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const handleSelectSong = async (songId: string) => {
    setSelectedSongId(songId);
    if (!isPlaying || !audioRef.current) {
      return;
    }

    try {
      await audioRef.current.play();
    } catch {
      setIsPlaying(false);
    }
  };

  const handleSeek = (nextTime: number) => {
    if (!audioRef.current) {
      return;
    }
    audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleStepTrack = async (direction: "next" | "prev") => {
    if (songs.length === 0 || activeIndex === -1) {
      return;
    }

    const nextIndex =
      direction === "next"
        ? (activeIndex + 1) % songs.length
        : (activeIndex - 1 + songs.length) % songs.length;

    setSelectedSongId(songs[nextIndex].id);

    if (!isPlaying || !audioRef.current) {
      return;
    }

    try {
      await audioRef.current.play();
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <main
      ref={rootRef}
      className={`relative min-h-screen overflow-hidden px-4 py-5 text-white ${paletteClass}`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://i.postimg.cc/FzSLnvWN/page-loading-bg.png')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/52 via-black/40 to-black/58" />

      <section className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[480px] flex-col overflow-hidden rounded-[2rem] border border-white/30 bg-transparent p-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-xl border border-white/45 bg-transparent px-3 py-2 text-xs font-semibold text-white hover:border-white"
          >
            <ArrowLeft size={13} /> Back
          </Link>
          <p className="inline-flex items-center gap-1 rounded-full border border-white/45 bg-transparent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90">
            <Music2 size={11} /> Music Lounge
          </p>
        </div>

        <div data-song-animate="hero" className="mt-4 rounded-2xl border border-white/35 bg-transparent p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
              Now Playing
            </p>
            <Disc3
              size={16}
              className={`text-white/90 ${isPlaying ? "animate-spin [animation-duration:2.5s]" : ""}`}
            />
          </div>

          <h1 className="line-clamp-2 text-lg font-bold text-white">
            {activeSong ? activeSong.title : "No songs found"}
          </h1>
          <p className="mt-1 text-xs text-white/80">
            {songs.length > 0 ? `${songs.length} tracks available` : "Upload files to /public/songs"}
          </p>

          <div className="mt-4">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={1}
              value={currentTime}
              onChange={(event) => handleSeek(Number(event.target.value))}
              disabled={!duration}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-amber-300 disabled:cursor-not-allowed"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-white/80">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleStepTrack("prev")}
              disabled={songs.length === 0}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-transparent text-white hover:border-white disabled:opacity-50"
            >
              <SkipBack size={17} />
            </button>
            <button
              type="button"
              onClick={handleTogglePlay}
              disabled={songs.length === 0}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg hover:bg-amber-100 disabled:opacity-50"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              type="button"
              onClick={() => handleStepTrack("next")}
              disabled={songs.length === 0}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-transparent text-white hover:border-white disabled:opacity-50"
            >
              <SkipForward size={17} />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/70"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search songs..."
              className="h-11 w-full rounded-xl border border-white/35 bg-transparent pl-9 pr-3 text-sm text-white placeholder:text-white/70 outline-none focus:border-amber-300/70"
            />
          </div>
        </div>

        <div className="mt-3 flex-1 overflow-y-auto pr-1">
          {filteredSongs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/40 bg-transparent p-4 text-center text-sm text-white/90">
              No songs yet. Upload `.mp3` files into `public/songs`.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSongs.map((song) => {
                const isActive = song.id === activeSong?.id;

                return (
                  <button
                    key={song.id}
                    data-song-animate="item"
                    type="button"
                    onClick={() => handleSelectSong(song.id)}
                    className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                      isActive
                        ? "border-amber-300 bg-transparent"
                        : "border-white/35 bg-transparent hover:border-white/65"
                    }`}
                  >
                    <p className="truncate text-sm font-semibold text-white">{song.title}</p>
                    <p className="mt-0.5 truncate text-[11px] text-white/75">{song.filename}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onEnded={() => handleStepTrack("next")}
      />
    </main>
  );
}
