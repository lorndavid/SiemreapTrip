"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import {
  BellRing,
  Bookmark,
  Camera,
  ChevronRight,
  Clock3,
  Headphones,
  Hand,
  Heart,
  House,
  Languages,
  MapPinned,
  Music4,
  Navigation,
  Pause,
  Play,
  PlayCircle,
  Radio,
  Search,
  Settings2,
  Shirt,
  Sunrise,
  UserRound,
  Volume2,
  X,
} from "lucide-react";
import { locationImageById, locationTypes, siemReapLocations } from "@/data/locations";
import { GuideLocation, LocationType } from "@/types/location";
import { SongTrack } from "@/types/song";
import EmergencyToolkit from "@/components/EmergencyToolkit";
import {
  CambodiaTimeSnapshot,
  calculateDistanceKm,
  formatDistanceKm,
  getCambodiaTimeSnapshot,
} from "@/lib/timeUtils";

type LanguageMode = "en" | "kh";
type AppTab = "home" | "place" | "save" | "profile";
type AppPalette = "man" | "woman" | "mix";
type AudioBehavior = "background" | "stop";
type ScrollMode = "smooth" | "auto";
type MotionMode = "dynamic" | "minimal";

function parseLanguage(raw: string | null): LanguageMode {
  return raw === "kh" ? "kh" : "en";
}

function createInitialTimeSnapshot(): CambodiaTimeSnapshot {
  return {
    hour: 0,
    minute: 0,
    totalMinutes: 0,
    formattedTime: "--:--",
    formattedDate: "---",
    isGoldenHour: false,
    phase: "day",
  };
}

function parseSavedIds(raw: string | null): number[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? parsed.filter((id) => Number.isInteger(id)) : [];
  } catch {
    return [];
  }
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

function formatAudioClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const defaultLocationImage = "https://i.postimg.cc/FzSLnvWN/page-loading-bg.png";

const uiText = {
  en: {
    brand: "ANGKOR GO",
    tagline: "Siem Reap in your pocket",
    tabs: {
      home: "Home",
      place: "Place",
      save: "Save",
      profile: "Profile",
    },
    welcome: "Smart travel, cleaner route, better day.",
    homeFeatured: "Featured Places",
    search: "Search places, temples, food...",
    filters: "Filters",
    all: "All",
    totalPlaces: "Total places",
    savedPlaces: "Saved",
    sunriseSpot: "Best sunrise",
    startExplore: "Explore now",
    mapLive: "Live map",
    musicLounge: "Music Lounge",
    musicLoungeDesc: "Play local travel vibes while planning your route.",
    openMusic: "Open Playlist",
    tracks: "Tracks",
    noTracks: "Add .mp3 files to /public/songs",
    introTitle: "Intro Soundtrack",
    introDesc: "Auto intro: Intro-Angkor (44s) then nisai-intro (18s).",
    introNow: "Now Playing",
    introAutoplayBlocked: "Autoplay may be blocked by browser. Tap Play to start.",
    introReplay: "Replay Intro",
    introPlay: "Play Intro",
    introPause: "Pause Intro",
    profilePlaylist: "My Playlist",
    profilePlaylistDesc: "Quick access to your uploaded MP3 tracks.",
    openFullPlaylist: "Open Full Playlist",
    noResultTitle: "No place found",
    noResultDesc: "Try another keyword or category.",
    duration: "Duration",
    bestTime: "Best time",
    budget: "Budget",
    highlight: "Highlight",
    directions: "Directions",
    save: "Save",
    saved: "Saved",
    idealTime: "Ideal time",
    savedHeader: "Your saved spots",
    savedEmptyTitle: "Nothing saved yet",
    savedEmptyDesc: "Tap Save on a place to keep it in your shortlist.",
    openInPlaces: "Open in Place tab",
    profileName: "Traveler",
    profileRole: "Angkor Explorer",
    language: "Language",
    khmerMode: "Khmer Mode",
    preferencesTitle: "Appearance & Motion",
    preferencesDesc: "Theme, scroll, animation, and audio controls in one page.",
    openSettingsCenter: "Open Settings",
    themeTitle: "App Theme",
    themeMan: "Man",
    themeWoman: "Woman",
    themeMix: "Mix",
    themeHint: "Pick a palette style for all pages.",
    audioTitle: "Audio in Background",
    audioModeBackground: "Keep Playing",
    audioModeStop: "Auto Stop",
    audioHint:
      "Browser can keep sound in background tab mode, but fully closing the app will stop audio.",
    scrollTitle: "Scroll Style",
    scrollSmooth: "Smooth",
    scrollAuto: "Normal",
    motionTitle: "Animation Mode",
    motionDynamic: "Dynamic",
    motionMinimal: "Minimal",
    notifications: "Notifications",
    settings: "Settings",
    tips: "Travel Tips",
    aboutTitle: "About Angkor Go",
    aboutDesc:
      "A mobile-first guide for discovering temples, local food, and culture with live map support.",
    etiquetteTitle: "Temple Etiquette",
    etiquetteDesc: "Before entering temples, please follow these local respect tips.",
    etiquetteAction: "I understand",
    etiquetteNotNow: "Close",
    etiquetteItems: {
      dress: "Dress respectfully and cover shoulders and knees.",
      voice: "Keep your voice low inside sacred areas.",
      touch: "Do not touch carvings or climb restricted zones.",
      photo: "Ask permission before close-up photos of monks.",
    },
    mapLoadingTitle: "Preparing map experience",
    mapLoadingDesc: "Loading pins, routes, and nearby highlights...",
    goldenHour: "Golden Hour",
    goldenRange: "5:00 PM - 6:30 PM",
    sunsetTracker: "Sunrise/Sunset Tracker",
    goldenNow: "Perfect lighting for photos right now!",
    passportTitle: "Angkor Quest Passport",
    passportProgress: "Temple check-ins",
    passportAction: "Check-in",
    passportChecking: "Checking location...",
    passportNeedLocation: "Location access is required for check-in.",
    passportUnlocked: "Secret tip unlocked",
    passportLocked: "Visit 5 temples to unlock a secret tip.",
    secretTip:
      "Try a quiet coffee break at Little Red Fox Espresso, tucked away from the main crowds.",
    moods: "Temple moods",
    checkInDone: "Checked in",
  },
  kh: {
    brand: "អង្គរ GO",
    tagline: "ណែនាំសៀមរាបនៅលើទូរស័ព្ទអ្នក",
    tabs: {
      home: "ទំព័រដើម",
      place: "កន្លែង",
      save: "រក្សាទុក",
      profile: "ប្រវត្តិ",
    },
    welcome: "ធ្វើដំណើរឆ្លាតវៃ ផ្លូវច្បាស់ និងបទពិសោធន៍ល្អជាងមុន។",
    homeFeatured: "កន្លែងពេញនិយម",
    search: "ស្វែងរកប្រាសាទ ទីកន្លែង ឬអាហារ...",
    filters: "តម្រង",
    all: "ទាំងអស់",
    totalPlaces: "កន្លែងសរុប",
    savedPlaces: "បានរក្សាទុក",
    sunriseSpot: "កន្លែងថ្ងៃរះល្អបំផុត",
    startExplore: "ចាប់ផ្តើមស្វែងរក",
    mapLive: "ផែនទីបន្តផ្ទាល់",
    musicLounge: "Music Lounge",
    musicLoungeDesc: "Play local travel vibes while planning your route.",
    openMusic: "Open Playlist",
    tracks: "Tracks",
    noTracks: "Add .mp3 files to /public/songs",
    introTitle: "Intro Soundtrack",
    introDesc: "Auto intro: Intro-Angkor (44s) then nisai-intro (18s).",
    introNow: "Now Playing",
    introAutoplayBlocked: "Autoplay may be blocked by browser. Tap Play to start.",
    introReplay: "Replay Intro",
    introPlay: "Play Intro",
    introPause: "Pause Intro",
    profilePlaylist: "My Playlist",
    profilePlaylistDesc: "Quick access to your uploaded MP3 tracks.",
    openFullPlaylist: "Open Full Playlist",
    noResultTitle: "មិនមានកន្លែងត្រូវនឹងស្វែងរក",
    noResultDesc: "សាកល្បងពាក្យផ្សេង ឬប្តូរប្រភេទ។",
    duration: "រយៈពេល",
    bestTime: "ពេលល្អបំផុត",
    budget: "ថវិកា",
    highlight: "ចំណុចពិសេស",
    directions: "ណែនាំផ្លូវ",
    save: "រក្សាទុក",
    saved: "បានរក្សា",
    idealTime: "ពេលសមស្រប",
    savedHeader: "កន្លែងដែលអ្នកបានរក្សាទុក",
    savedEmptyTitle: "មិនទាន់មានកន្លែងរក្សាទុក",
    savedEmptyDesc: "ចុចប៊ូតុងរក្សាទុកនៅកន្លែងណាមួយ ដើម្បីរក្សាទុកទុកប្រើពេលក្រោយ។",
    openInPlaces: "បើកក្នុងផ្ទាំងកន្លែង",
    profileName: "អ្នកធ្វើដំណើរ",
    profileRole: "អ្នកស្វែងរកអង្គរ",
    language: "ភាសា",
    khmerMode: "របៀបខ្មែរ",
    preferencesTitle: "Appearance & Motion",
    preferencesDesc: "Theme, scroll, animation, and audio controls in one page.",
    openSettingsCenter: "Open Settings",
    themeTitle: "Theme App",
    themeMan: "Man",
    themeWoman: "Woman",
    themeMix: "Mix",
    themeHint: "ជ្រើសពណ៌ Theme សម្រាប់ទំព័រទាំងអស់។",
    audioTitle: "Audio in Background",
    audioModeBackground: "Keep Playing",
    audioModeStop: "Auto Stop",
    audioHint:
      "Browser can keep sound in background tab mode, but fully closing the app will stop audio.",
    scrollTitle: "Scroll Style",
    scrollSmooth: "Smooth",
    scrollAuto: "Normal",
    motionTitle: "Animation Mode",
    motionDynamic: "Dynamic",
    motionMinimal: "Minimal",
    notifications: "ការជូនដំណឹង",
    settings: "ការកំណត់",
    tips: "គន្លឹះធ្វើដំណើរ",
    aboutTitle: "អំពី Angkor Go",
    aboutDesc:
      "កម្មវិធីណែនាំទេសចរណ៍លើទូរស័ព្ទ សម្រាប់ស្វែងរកប្រាសាទ អាហារ និងវប្បធម៌ ជាមួយផែនទីបន្តផ្ទាល់។",
    etiquetteTitle: "គោរពវិន័យក្នុងប្រាសាទ",
    etiquetteDesc: "មុនចូលទស្សនាប្រាសាទ សូមគោរពតាមណែនាំខាងក្រោម។",
    etiquetteAction: "យល់ព្រម",
    etiquetteNotNow: "បិទ",
    etiquetteItems: {
      dress: "ស្លៀកពាក់សមរម្យ បិទស្មា និងជង្គង់។",
      voice: "និយាយសំឡេងទាប នៅតំបន់សក្ការៈ។",
      touch: "កុំប៉ះចម្លាក់ ឬឡើងតំបន់ហាមឃាត់។",
      photo: "សុំអនុញ្ញាតមុនថតជិតជាមួយព្រះសង្ឃ។",
    },
    mapLoadingTitle: "កំពុងរៀបចំផែនទី",
    mapLoadingDesc: "កំពុងផ្ទុកទីតាំង ផ្លូវ និងកន្លែងពិសេសជិតខាង...",
    goldenHour: "Golden Hour",
    goldenRange: "5:00 PM - 6:30 PM",
    sunsetTracker: "Sunrise/Sunset Tracker",
    goldenNow: "Perfect lighting for photos right now!",
    passportTitle: "Angkor Quest Passport",
    passportProgress: "Temple check-ins",
    passportAction: "Check-in",
    passportChecking: "Checking location...",
    passportNeedLocation: "Location access is required for check-in.",
    passportUnlocked: "Secret tip unlocked",
    passportLocked: "Visit 5 temples to unlock a secret tip.",
    secretTip:
      "Try a quiet coffee break at Little Red Fox Espresso, tucked away from the main crowds.",
    moods: "Temple moods",
    checkInDone: "Checked in",
  },
};

const typeLabels: Record<LocationType, { en: string; kh: string }> = {
  Temple: { en: "Temple", kh: "ប្រាសាទ" },
  Nature: { en: "Nature", kh: "ធម្មជាតិ" },
  Dining: { en: "Dining", kh: "អាហារ" },
  Shopping: { en: "Shopping", kh: "ទិញទំនិញ" },
  Museum: { en: "Museum", kh: "សារមន្ទីរ" },
  Culture: { en: "Culture", kh: "វប្បធម៌" },
};

const navItems = [
  { key: "home", icon: House },
  { key: "place", icon: MapPinned },
  { key: "save", icon: Bookmark },
  { key: "profile", icon: UserRound },
] as const;

const introSequenceTracks = [
  {
    src: "/songs/Intro-Angkor.mp3",
    labelEn: "Intro Angkor",
    labelKh: "Intro Angkor",
    duration: 44,
  },
  {
    src: "/songs/nisai-intro.mp3",
    labelEn: "Nisai Intro",
    labelKh: "Nisai Intro",
    duration: 18,
  },
] as const;

function toGoogleMapsLink(location: GuideLocation) {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
}

function LocationThumb({
  location,
  typeLabel,
  className,
}: {
  location: GuideLocation;
  typeLabel: string;
  className?: string;
}) {
  const imageMeta = locationImageById[location.id];
  const fallbackImage = "https://i.postimg.cc/FzSLnvWN/page-loading-bg.png";

  return (
    <div
      className={`group relative shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${className ?? "h-14 w-14"}`}
    >
      <Image
        src={imageMeta?.src ?? fallbackImage}
        alt={`${imageMeta?.title ?? location.name} - ${imageMeta?.place ?? "Siem Reap, Cambodia"}`}
        fill
        sizes="64px"
        loading="lazy"
        unoptimized
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-1.5 pb-1 pt-4">
        <span className="line-clamp-1 text-[9px] font-semibold tracking-[0.08em] text-white">
          {typeLabel}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const rootRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const etiquetteCardRef = useRef<HTMLDivElement | null>(null);
  const splashRef = useRef<HTMLDivElement | null>(null);
  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasLoadedSavedIdsRef = useRef(false);

  const [language, setLanguage] = useState<LanguageMode>("en");
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [activeType, setActiveType] = useState<LocationType | "All">("All");
  const [isNearbyOnly, setIsNearbyOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedLocId, setSelectedLocId] = useState(siemReapLocations[0].id);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [deferredInstallEvent, setDeferredInstallEvent] = useState<Event | null>(null);
  const [hasShownEtiquette, setHasShownEtiquette] = useState(false);
  const [isEtiquetteOpen, setIsEtiquetteOpen] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [appPalette, setAppPalette] = useState<AppPalette>("mix");
  const [audioBehavior, setAudioBehavior] = useState<AudioBehavior>("stop");
  const [scrollMode, setScrollMode] = useState<ScrollMode>("smooth");
  const [motionMode, setMotionMode] = useState<MotionMode>("dynamic");
  const [songCount, setSongCount] = useState<number | null>(null);
  const [songLibrary, setSongLibrary] = useState<SongTrack[]>([]);
  const [introTrackIndex, setIntroTrackIndex] = useState(0);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [introCurrentTime, setIntroCurrentTime] = useState(0);
  const [introDuration, setIntroDuration] = useState<number>(introSequenceTracks[0].duration);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  const [introAutoplayBlocked, setIntroAutoplayBlocked] = useState(false);
  const [hasStartedIntro, setHasStartedIntro] = useState(false);
  const [timeSnapshot, setTimeSnapshot] = useState<CambodiaTimeSnapshot>(
    createInitialTimeSnapshot,
  );

  const text = uiText[language];
  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);

  const themeClass =
    timeSnapshot.phase === "golden"
      ? "theme-golden"
      : timeSnapshot.phase === "night"
        ? "theme-night"
        : "theme-day";
  const paletteClass =
    appPalette === "man"
      ? "palette-man"
      : appPalette === "woman"
        ? "palette-woman"
        : "palette-mix";

  const filteredLocations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return siemReapLocations.filter((location) => {
      const typeMatch = activeType === "All" || location.type === activeType;
      const searchPool = [
        location.name,
        location.nameKh,
        location.desc,
        location.descKh,
        location.highlight,
        location.highlightKh,
      ];
      const queryMatch =
        normalizedQuery.length === 0 ||
        searchPool.some((value) => value.toLowerCase().includes(normalizedQuery));
      const nearbyMatch =
        !isNearbyOnly ||
        !userPosition ||
        calculateDistanceKm(userPosition.lat, userPosition.lng, location.lat, location.lng) <= 8;

      return typeMatch && queryMatch && nearbyMatch;
    });
  }, [activeType, isNearbyOnly, query, userPosition]);

  const savedLocations = useMemo(
    () => siemReapLocations.filter((location) => savedSet.has(location.id)),
    [savedSet],
  );

  const typeCounts = useMemo(() => {
    return locationTypes.reduce(
      (acc, type) => {
        if (type === "All") {
          acc.All = siemReapLocations.length;
          return acc;
        }
        acc[type] = siemReapLocations.filter((location) => location.type === type).length;
        return acc;
      },
      {
        All: 0,
        Temple: 0,
        Nature: 0,
        Dining: 0,
        Shopping: 0,
        Museum: 0,
        Culture: 0,
      } as Record<LocationType | "All", number>,
    );
  }, []);

  const heroSlides = siemReapLocations.map((location) => ({
    location,
    imageSrc: locationImageById[location.id]?.src ?? defaultLocationImage,
    place: locationImageById[location.id]?.place ?? "Siem Reap, Cambodia",
  }));

  const activeHeroSlide = heroSlides[heroSlideIndex] ?? heroSlides[0] ?? null;

  useEffect(() => {
    if (motionMode === "minimal") {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-animate='top']",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      );
      gsap.fromTo(
        "[data-animate='nav']",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.1, ease: "power2.out" },
      );
    }, rootRef);

    return () => context.revert();
  }, [motionMode]);

  useEffect(() => {
    if (activeTab !== "home" || heroSlides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setHeroSlideIndex((previous) => (previous + 1) % heroSlides.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [activeTab, heroSlides.length]);

  useEffect(() => {
    if (motionMode === "minimal") {
      const timer = window.setTimeout(() => setIsBooting(false), 650);
      return () => window.clearTimeout(timer);
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline();
      timeline
        .fromTo(
          "[data-splash='panel']",
          { opacity: 0, y: 24, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" },
        )
        .fromTo(
          "[data-splash='loader']",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
          "-=0.25",
        );
    }, splashRef);

    const timer = window.setTimeout(() => {
      setIsBooting(false);
    }, 3200);

    return () => {
      context.revert();
      window.clearTimeout(timer);
    };
  }, [motionMode]);

  useEffect(() => {
    const updateTime = () => {
      setTimeSnapshot(getCambodiaTimeSnapshot(language));
    };

    updateTime();
    const timer = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(timer);
  }, [language]);

  useEffect(() => {
    if (!contentRef.current) {
      return;
    }

    if (motionMode === "minimal") {
      return;
    }

    const items = contentRef.current.querySelectorAll("[data-tab-item]");
    gsap.fromTo(
      items,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power2.out" },
    );
  }, [
    activeTab,
    language,
    filteredLocations.length,
    savedLocations.length,
    motionMode,
  ]);

  useEffect(() => {
    const initialSavedIds = parseSavedIds(window.localStorage.getItem("sr_saved_ids"));

    queueMicrotask(() => {
      setSavedIds(initialSavedIds);
      hasLoadedSavedIdsRef.current = true;
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedSavedIdsRef.current) {
      return;
    }
    window.localStorage.setItem("sr_saved_ids", JSON.stringify(savedIds));
  }, [savedIds]);

  useEffect(() => {
    const storedLanguage = parseLanguage(window.localStorage.getItem("sr_language"));
    const storedPalette = parsePalette(window.localStorage.getItem("sr_app_palette"));
    const storedAudioBehavior = parseAudioBehavior(window.localStorage.getItem("sr_audio_behavior"));
    const storedScrollMode = parseScrollMode(window.localStorage.getItem("sr_scroll_mode"));
    const storedMotionMode = parseMotionMode(window.localStorage.getItem("sr_motion_mode"));

    queueMicrotask(() => {
      setLanguage(storedLanguage);
      setAppPalette(storedPalette);
      setAudioBehavior(storedAudioBehavior);
      setScrollMode(storedScrollMode);
      setMotionMode(storedMotionMode);
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sr_language", language);
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem("sr_app_palette", appPalette);
  }, [appPalette]);

  useEffect(() => {
    window.localStorage.setItem("sr_audio_behavior", audioBehavior);
  }, [audioBehavior]);

  useEffect(() => {
    window.localStorage.setItem("sr_scroll_mode", scrollMode);
  }, [scrollMode]);

  useEffect(() => {
    window.localStorage.setItem("sr_motion_mode", motionMode);
  }, [motionMode]);

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
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredInstallEvent(event);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/songs")
      .then((response) => response.json() as Promise<{ count?: number; songs?: SongTrack[] }>)
      .then((payload) => {
        if (!isMounted) {
          return;
        }
        setSongLibrary(Array.isArray(payload.songs) ? payload.songs : []);
        setSongCount(typeof payload.count === "number" ? payload.count : 0);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }
        setSongLibrary([]);
        setSongCount(0);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isEtiquetteOpen || !etiquetteCardRef.current) {
      return;
    }

    if (motionMode === "minimal") {
      return;
    }

    gsap.fromTo(
      etiquetteCardRef.current,
      { opacity: 0, y: 24, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" },
    );
  }, [isEtiquetteOpen, language, motionMode]);

  const playTrackByIndex = useCallback(async (index: number) => {
    const audio = introAudioRef.current;
    const track = introSequenceTracks[index];

    if (!audio || !track) {
      return false;
    }

    audio.src = track.src;
    audio.currentTime = 0;
    audio.load();
    setIntroDuration(track.duration);

    try {
      await audio.play();
      setIsIntroPlaying(true);
      setIntroAutoplayBlocked(false);
      return true;
    } catch {
      setIsIntroPlaying(false);
      setIntroAutoplayBlocked(true);
      return false;
    }
  }, []);

  const handleIntroReplay = useCallback(async () => {
    setHasStartedIntro(true);
    setIntroTrackIndex(0);
    setIntroCurrentTime(0);
    await playTrackByIndex(0);
  }, [playTrackByIndex]);

  const handleIntroToggle = useCallback(async () => {
    const audio = introAudioRef.current;
    if (!audio) {
      return;
    }

    if (isIntroPlaying) {
      audio.pause();
      setIsIntroPlaying(false);
      return;
    }

    setHasStartedIntro(true);

    if (!audio.src) {
      await playTrackByIndex(introTrackIndex);
      return;
    }

    try {
      await audio.play();
      setIsIntroPlaying(true);
      setIntroAutoplayBlocked(false);
    } catch {
      setIsIntroPlaying(false);
      setIntroAutoplayBlocked(true);
    }
  }, [introTrackIndex, isIntroPlaying, playTrackByIndex]);

  const handleIntroEnded = useCallback(async () => {
    const nextIndex = introTrackIndex + 1;

    if (nextIndex < introSequenceTracks.length) {
      setIntroTrackIndex(nextIndex);
      setIntroCurrentTime(0);
      await playTrackByIndex(nextIndex);
      return;
    }

    setIsIntroPlaying(false);
    setIntroTrackIndex(0);
    setIntroCurrentTime(0);
    const audio = introAudioRef.current;
    if (!audio) {
      return;
    }
    audio.src = introSequenceTracks[0].src;
    audio.currentTime = 0;
    audio.load();
    setIntroDuration(introSequenceTracks[0].duration);
  }, [introTrackIndex, playTrackByIndex]);

  useEffect(() => {
    if (!isBooting || hasStartedIntro) {
      return;
    }

    const timer = window.setTimeout(() => {
      void handleIntroReplay();
    }, 420);

    return () => window.clearTimeout(timer);
  }, [hasStartedIntro, handleIntroReplay, isBooting]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden || audioBehavior === "background") {
        return;
      }

      if (introAudioRef.current && !introAudioRef.current.paused) {
        introAudioRef.current.pause();
      }
    };

    const handlePageHide = () => {
      if (audioBehavior === "background") {
        return;
      }

      if (introAudioRef.current && !introAudioRef.current.paused) {
        introAudioRef.current.pause();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [audioBehavior]);

  const localizeName = (location: GuideLocation) =>
    language === "kh" ? location.nameKh : location.name;

  const localizeDescription = (location: GuideLocation) =>
    language === "kh" ? location.descKh : location.desc;

  const localizeType = (type: LocationType) => typeLabels[type][language];
  const getPlaceLabel = (location: GuideLocation) =>
    locationImageById[location.id]?.place ?? "Siem Reap, Cambodia";
  const introTrack = introSequenceTracks[introTrackIndex] ?? introSequenceTracks[0];
  const introTrackLabel = language === "kh" ? introTrack.labelKh : introTrack.labelEn;
  const introProgress =
    introDuration > 0 ? Math.min((introCurrentTime / introDuration) * 100, 100) : 0;
  const profileTracks = songLibrary.slice(0, 4);
  const nearbyToggleText = language === "kh" ? "ក្បែរខ្ញុំ (8km)" : "Nearby (8km)";
  const localFavoriteLabel = language === "kh" ? "ពេញនិយមក្នុងតំបន់" : "Local Favorites";
  const localPicks = siemReapLocations.filter(
    (location) =>
      location.type === "Dining" || location.type === "Culture" || location.type === "Shopping",
  );
  const installTitle =
    language === "kh" ? "Offline Trip Mode" : "Offline Trip Mode";
  const installSubtitle =
    language === "kh"
      ? "Cache map + saved places for no internet."
      : "Cache map + saved places for no internet.";
  const installAction =
    language === "kh" ? "Install app" : "Install app";
  const installReady =
    language === "kh"
      ? "App is install-ready on this device."
      : "App is install-ready on this device.";
  const installDone =
    language === "kh"
      ? "Already installed or unavailable on this browser."
      : "Already installed or unavailable on this browser.";

  const etiquetteTips = [
    { key: "dress", icon: Shirt, text: text.etiquetteItems.dress },
    { key: "voice", icon: Volume2, text: text.etiquetteItems.voice },
    { key: "touch", icon: Hand, text: text.etiquetteItems.touch },
    { key: "photo", icon: Camera, text: text.etiquetteItems.photo },
  ] as const;

  const handleTabChange = (nextTab: AppTab) => {
    setActiveTab(nextTab);

    if (nextTab === "place") {
      if (!hasShownEtiquette) {
        setHasShownEtiquette(true);
        setIsEtiquetteOpen(true);
      }
    }
  };

  const handleInstallApp = async () => {
    if (!deferredInstallEvent) {
      return;
    }

    const promptEvent = deferredInstallEvent as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
    };

    await promptEvent.prompt();
    await promptEvent.userChoice;
    setDeferredInstallEvent(null);
  };

  const toggleSave = (locationId: number) => {
    setSavedIds((previousSaved) =>
      previousSaved.includes(locationId)
        ? previousSaved.filter((id) => id !== locationId)
        : [...previousSaved, locationId],
    );
  };

  return (
    <main
      ref={rootRef}
      className={`relative min-h-screen bg-[var(--screen-bg)] px-3 py-4 transition-colors md:px-6 ${themeClass} ${paletteClass}`}
    >
      <div
        className={`relative mx-auto flex h-[calc(100vh-2rem)] w-full max-w-[460px] flex-col overflow-hidden rounded-[34px] border border-slate-200/80 bg-[var(--phone-bg)] shadow-[0_28px_60px_-30px_rgba(15,23,42,0.55)] ${language === "kh" ? "lang-kh" : "lang-en"}`}
      >
        <header
          data-animate="top"
          className="relative overflow-hidden rounded-b-[32px] px-5 pb-5 pt-5 text-white"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://i.postimg.cc/qvsdBKK4/vecteezy-asean-scenery-country-background-of-cambodia-with-angkor-wat-5644005-1.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/52 via-slate-900/36 to-slate-950/66" />
          <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10 blur-sm" />
          <div className="pointer-events-none absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-white/10 blur-sm" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <Image
              src="/logo-travel.png"
              alt="Angkor Go"
              width={198}
              height={62}
              className="h-14 w-auto max-w-[72%] object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.3)]"
              priority
            />

            <div className="rounded-2xl border border-white/45 bg-transparent p-1">
              <div className="grid min-w-[82px] grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`rounded-xl px-1.5 py-1 text-[10px] font-semibold leading-none transition-colors ${
                    language === "en"
                      ? "border border-white text-white"
                      : "border border-transparent text-white/80 hover:border-white/55"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("kh")}
                  className={`rounded-xl px-1.5 py-1 text-[10px] font-semibold leading-none transition-colors ${
                    language === "kh"
                      ? "border border-white text-white"
                      : "border border-transparent text-white/80 hover:border-white/55"
                  }`}
                >
                  KH
                </button>
              </div>
            </div>
          </div>
        </header>

        <section
          ref={contentRef}
          className="flex-1 overflow-y-auto px-4 pb-24 pt-4"
        >
          {activeTab === "home" && (
            <div className="space-y-3">
              <div
                data-tab-item
                className="relative overflow-hidden rounded-[1.6rem] border border-white/35 p-4 text-white shadow-[0_24px_44px_-28px_rgba(15,23,42,0.85)]"
              >
                <div className="absolute inset-0">
                  {activeHeroSlide && (
                    <Image
                      key={activeHeroSlide.location.id}
                      src={activeHeroSlide.imageSrc}
                      alt={`${activeHeroSlide.location.name} - ${activeHeroSlide.place}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 460px"
                      loading="eager"
                      unoptimized
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/52 to-black/68" />

                <div className="relative z-10">
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-transparent px-2.5 py-1 text-[10px] font-semibold">
                    <Radio size={12} /> {text.mapLive}
                  </div>
                  <h2 className="app-heading text-[1.08rem] leading-tight">
                    {language === "kh"
                      ? activeHeroSlide?.location.nameKh ?? "ផែនការដំណើរឆ្លាតវៃ"
                      : activeHeroSlide?.location.name ?? "Plan Smarter. Explore Better."}
                  </h2>
                  <p className="mt-1 text-xs text-white/90">
                    {language === "kh"
                      ? activeHeroSlide?.location.descKh ?? text.welcome
                      : activeHeroSlide?.location.desc ?? text.welcome}
                  </p>
                  <p className="mt-1 text-[11px] text-white/75">
                    {activeHeroSlide?.place ?? "Siem Reap, Cambodia"}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    {heroSlides.slice(0, 6).map((slide, index) => {
                      const isActiveDot = heroSlideIndex % 6 === index;
                      return (
                        <span
                          key={slide.location.id}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isActiveDot ? "w-5 bg-white" : "w-2.5 bg-white/55"
                          }`}
                        />
                      );
                    })}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleTabChange("place")}
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-950/85 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      {text.startExplore} <ChevronRight size={14} />
                    </button>
                    <Link
                      href="/songs"
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100"
                    >
                      <Music4 size={13} /> {text.openMusic}
                    </Link>
                  </div>
                </div>
              </div>

              <div
                data-tab-item
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_34px_-26px_rgba(15,23,42,0.6)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {text.introTitle}
                    </p>
                    <h3 className="app-heading mt-0.5 text-base text-slate-900">{introTrackLabel}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{text.introDesc}</p>
                  </div>
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                    <Headphones size={16} />
                  </div>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-[width] duration-500"
                    style={{ width: `${Math.max(introProgress, isIntroPlaying ? 4 : 0)}%` }}
                  />
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium text-slate-500">
                  <span>{text.introNow}: {introTrackLabel}</span>
                  <span>{formatAudioClock(introCurrentTime)} / {formatAudioClock(introDuration)}</span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => void handleIntroToggle()}
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white hover:bg-slate-700"
                  >
                    {isIntroPlaying ? <Pause size={13} /> : <Play size={13} />}
                    {isIntroPlaying ? text.introPause : text.introPlay}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleIntroReplay()}
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    <Radio size={13} /> {text.introReplay}
                  </button>
                  <Link
                    href="/songs"
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    <Music4 size={13} /> {text.openMusic}
                  </Link>
                </div>

                {introAutoplayBlocked && (
                  <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] text-amber-700">
                    {text.introAutoplayBlocked}
                  </p>
                )}
              </div>

              <div data-tab-item className="space-y-2">
                <h2 className="app-heading text-base text-slate-900">{text.homeFeatured}</h2>
                {siemReapLocations.slice(0, 4).map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => {
                      setSelectedLocId(location.id);
                      handleTabChange("place");
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-[0_16px_32px_-26px_rgba(15,23,42,0.65)] transition-transform hover:-translate-y-0.5"
                  >
                    <LocationThumb
                      location={location}
                      typeLabel={localizeType(location.type)}
                      className="h-14 w-14"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {localizeName(location)}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">{getPlaceLabel(location)}</p>
                      <p className="line-clamp-1 text-xs text-slate-600">
                        {localizeDescription(location)}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-slate-500">
                        {text.bestTime}: {location.bestTime}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "place" && (
            <div className="space-y-3">
              <div
                data-tab-item
                className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]"
              >
                <div className="relative">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={text.search}
                    className="h-10 w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-red-400 focus:bg-white"
                  />
                </div>

                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {text.filters}
                </p>
                <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
                  {locationTypes.map((type) => {
                    const isActive = activeType === type;
                    const localizedType =
                      type === "All" ? text.all : localizeType(type as LocationType);

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setActiveType(type)}
                        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isActive
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-slate-300 bg-white text-slate-600"
                        }`}
                      >
                        {localizedType} ({typeCounts[type]})
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setIsNearbyOnly((previous) => !previous)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isNearbyOnly
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white text-slate-600"
                    }`}
                  >
                    {nearbyToggleText}
                  </button>
                </div>

                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {localFavoriteLabel}
                </p>
                <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
                  {localPicks.map((location) => (
                    <Link
                      key={location.id}
                      href={`/place/${location.id}`}
                      onClick={() => setSelectedLocId(location.id)}
                      className="shrink-0 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      {localizeName(location)}
                    </Link>
                  ))}
                </div>
              </div>

              {timeSnapshot.isGoldenHour && (
                <div
                  data-tab-item
                  className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-100 via-orange-100 to-violet-100 p-3 text-[12px] font-semibold text-amber-900 shadow-[0_16px_30px_-24px_rgba(245,158,11,0.75)]"
                >
                  {text.goldenNow}
                </div>
              )}

              <div data-tab-item className="space-y-2">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((location) => {
                    const isSaved = savedSet.has(location.id);
                    const isSelected = selectedLocId === location.id;
                    const distanceKm = userPosition
                      ? calculateDistanceKm(
                          userPosition.lat,
                          userPosition.lng,
                          location.lat,
                          location.lng,
                        )
                      : null;

                    return (
                      <article
                        key={location.id}
                        className={`rounded-2xl border bg-white p-3 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.65)] ${
                          isSelected ? "border-red-400" : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <LocationThumb
                            location={location}
                            typeLabel={localizeType(location.type)}
                            className="h-12 w-12"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">{localizeName(location)}</p>
                            <p className="mt-0.5 truncate text-[11px] text-slate-500">{getPlaceLabel(location)}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{localizeDescription(location)}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                <Clock3 size={11} className="mr-1 inline-block" />
                                {location.duration}
                              </span>
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                <Sunrise size={11} className="mr-1 inline-block" />
                                {location.bestTime}
                              </span>
                              {distanceKm !== null && (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                                  {language === "kh" ? "ចម្ងាយ" : "Distance"}: {formatDistanceKm(distanceKm)}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSave(location.id)}
                            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              isSaved ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Heart size={14} fill={isSaved ? "currentColor" : "none"} />
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Link
                            href={`/place/${location.id}`}
                            onClick={() => setSelectedLocId(location.id)}
                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white hover:bg-slate-700"
                          >
                            {language === "kh" ? "មើលផែនទីពេញ" : "Open Full Map"}
                          </Link>
                          <a
                            href={toGoogleMapsLink(location)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            <Navigation size={12} /> {text.directions}
                          </a>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-center">
                    <p className="text-sm font-semibold text-slate-800">{text.noResultTitle}</p>
                    <p className="mt-1 text-xs text-slate-500">{text.noResultDesc}</p>
                  </div>
                )}
              </div>

              {isEtiquetteOpen && (
                <div className="fixed inset-0 z-[700] flex items-center justify-center bg-slate-900/38 p-3 backdrop-blur-[2px]">
                  <div
                    ref={etiquetteCardRef}
                    className="w-full max-w-[340px] rounded-2xl bg-white p-4 shadow-[0_22px_45px_-24px_rgba(15,23,42,0.7)]"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-600">
                          {text.tips}
                        </p>
                        <h3 className="app-heading mt-0.5 text-base text-slate-900">
                          {text.etiquetteTitle}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEtiquetteOpen(false)}
                        className="rounded-full bg-slate-100 p-1 text-slate-500 hover:bg-slate-200"
                        aria-label={text.etiquetteNotNow}
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-600">{text.etiquetteDesc}</p>

                    <div className="mt-3 space-y-2">
                      {etiquetteTips.map((item) => {
                        const Icon = item.icon;
                        return (
                          <p
                            key={item.key}
                            className="flex items-start gap-2 rounded-xl bg-slate-50 px-2.5 py-2 text-[11px] text-slate-700"
                          >
                            <Icon size={13} className="mt-0.5 text-red-500" />
                            <span>{item.text}</span>
                          </p>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEtiquetteOpen(false)}
                        className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        {text.etiquetteAction}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEtiquetteOpen(false)}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        {text.etiquetteNotNow}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "save" && (
            <div className="space-y-3">
              <div
                data-tab-item
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]"
              >
                <h2 className="app-heading text-base text-slate-900">{text.savedHeader}</h2>
                <p className="mt-1 text-xs text-slate-600">
                  {text.savedPlaces}: {savedLocations.length}
                </p>
              </div>

              {savedLocations.length > 0 ? (
                savedLocations.map((location) => (
                  <article
                    key={location.id}
                    data-tab-item
                    className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.65)]"
                  >
                    <div className="flex items-start gap-3">
                      <LocationThumb
                        location={location}
                        typeLabel={localizeType(location.type)}
                        className="h-14 w-14"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{localizeName(location)}</p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">{getPlaceLabel(location)}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                          {localizeDescription(location)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link
                        href={`/place/${location.id}`}
                        onClick={() => setSelectedLocId(location.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-700"
                      >
                        <MapPinned size={12} /> {language === "kh" ? "មើលផែនទីពេញ" : "Open Full Map"}
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleSave(location.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700"
                      >
                        <Heart size={12} fill="currentColor" /> {text.saved}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div
                  data-tab-item
                  className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-center"
                >
                  <p className="text-sm font-semibold text-slate-800">{text.savedEmptyTitle}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{text.savedEmptyDesc}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-3">
              <div
                data-tab-item
                className="relative overflow-hidden rounded-[1.7rem] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-white shadow-[0_24px_44px_-28px_rgba(15,23,42,0.95)]"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-300/15 blur-2xl" />
                <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-rose-300/15 blur-2xl" />

                <div className="relative z-10 flex items-center gap-3">
                  <div className="relative h-20 w-20 overflow-hidden rounded-[1.15rem] border border-white/35 bg-white/10 shadow-[0_16px_34px_-22px_rgba(15,23,42,0.85)]">
                    <Image
                      src="/icon-travel.png"
                      alt="Traveler profile"
                      fill
                      sizes="80px"
                      className="object-cover scale-[2.35]"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="inline-flex rounded-full border border-white/30 bg-white/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85">
                      {language === "kh" ? "PRO" : "PRO"}
                    </p>
                    <h2 className="app-heading mt-1 truncate text-lg">{text.profileName}</h2>
                    <p className="text-xs text-slate-200">{text.profileRole}</p>
                  </div>
                  <Link
                    href="/settings"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-white/90 hover:bg-white/20"
                  >
                    <Settings2 size={14} />
                  </Link>
                </div>

                <div className="relative z-10 mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-white/20 bg-white/10 p-2 text-center">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/70">
                      {text.totalPlaces}
                    </p>
                    <p className="mt-1 text-sm font-bold">{siemReapLocations.length}</p>
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/10 p-2 text-center">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/70">
                      {text.savedPlaces}
                    </p>
                    <p className="mt-1 text-sm font-bold">{savedIds.length}</p>
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/10 p-2 text-center">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/70">
                      {text.tracks}
                    </p>
                    <p className="mt-1 text-sm font-bold">{songCount ?? "--"}</p>
                  </div>
                </div>
              </div>

              <div
                data-tab-item
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {language === "kh" ? "Travel Snapshot" : "Travel Snapshot"}
                  </p>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    LIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-red-100 bg-gradient-to-b from-red-50 to-white p-3 text-center">
                    <MapPinned size={14} className="mx-auto text-red-500" />
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {text.totalPlaces}
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-slate-900">{siemReapLocations.length}</p>
                  </div>
                  <div className="rounded-2xl border border-rose-100 bg-gradient-to-b from-rose-50 to-white p-3 text-center">
                    <Heart size={14} className="mx-auto text-rose-500" />
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {text.savedPlaces}
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-slate-900">{savedIds.length}</p>
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-3 text-center">
                    <Music4 size={14} className="mx-auto text-blue-500" />
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {text.tracks}
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-slate-900">{songCount ?? "--"}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-gradient-to-b from-amber-50 to-white p-3 text-center">
                    <Sunrise size={14} className="mx-auto text-amber-500" />
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {text.goldenHour}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-slate-900">{text.goldenRange}</p>
                  </div>
                </div>
              </div>

              <div data-tab-item className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {text.language}
                </p>
                <div className="mt-2 inline-flex rounded-2xl border border-slate-300 bg-transparent p-1">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold leading-none ${
                      language === "en"
                        ? "border border-slate-900 text-slate-900"
                        : "border border-transparent text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("kh")}
                    className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold leading-none ${
                      language === "kh"
                        ? "border border-slate-900 text-slate-900"
                        : "border border-transparent text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    KH
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  <Languages size={12} className="mr-1 inline-block" />
                  {text.khmerMode}
                </p>
              </div>

              <div
                data-tab-item
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {text.preferencesTitle}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">{text.preferencesDesc}</p>
                  </div>
                  <Link
                    href="/settings"
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-700"
                  >
                    <Settings2 size={13} /> {text.openSettingsCenter}
                  </Link>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {text.themeTitle}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800">
                      {appPalette === "man"
                        ? text.themeMan
                        : appPalette === "woman"
                          ? text.themeWoman
                          : text.themeMix}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {text.scrollTitle}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800">
                      {scrollMode === "smooth" ? text.scrollSmooth : text.scrollAuto}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {text.motionTitle}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800">
                      {motionMode === "dynamic" ? text.motionDynamic : text.motionMinimal}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {text.audioTitle}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-800">
                      {audioBehavior === "background" ? text.audioModeBackground : text.audioModeStop}
                    </p>
                  </div>
                </div>
              </div>

              <div
                data-tab-item
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {language === "kh" ? "Quick Actions" : "Quick Actions"}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTabChange("place")}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <MapPinned size={12} /> {text.tabs.place}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange("save")}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Heart size={12} /> {text.tabs.save}
                  </button>
                  <Link
                    href="/songs"
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-2 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    <Music4 size={12} /> {text.openFullPlaylist}
                  </Link>
                  <Link
                    href="/settings"
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Settings2 size={12} /> {text.settings}
                  </Link>
                </div>
              </div>

              <div data-tab-item className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {installTitle}
                </p>
                <p className="mt-1 text-xs text-slate-600">{installSubtitle}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {deferredInstallEvent ? installReady : installDone}
                </p>
                <button
                  type="button"
                  onClick={handleInstallApp}
                  disabled={!deferredInstallEvent}
                  className={`mt-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                    deferredInstallEvent
                      ? "bg-slate-900 text-white hover:bg-slate-700"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {installAction}
                </button>
              </div>

              <div data-tab-item>
                <EmergencyToolkit language={language} />
              </div>

              <div
                data-tab-item
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {text.profilePlaylist}
                    </p>
                    <h3 className="app-heading mt-0.5 text-base text-slate-900">{text.musicLounge}</h3>
                    <p className="mt-1 text-xs text-slate-600">{text.profilePlaylistDesc}</p>
                  </div>
                  <Link
                    href="/songs"
                    className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    <PlayCircle size={13} /> {text.openFullPlaylist}
                  </Link>
                </div>

                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                  {profileTracks.length > 0 ? (
                    profileTracks.map((song, index) => (
                      <p
                        key={song.id}
                        className={`flex items-center justify-between bg-slate-50 px-2.5 py-2 text-[11px] text-slate-700 ${
                          index !== profileTracks.length - 1 ? "border-b border-slate-200" : ""
                        }`}
                      >
                        <span className="truncate">
                          <span className="mr-1 font-semibold text-slate-500">{index + 1}.</span>
                          {song.title}
                        </span>
                        <Music4 size={12} className="shrink-0 text-slate-400" />
                      </p>
                    ))
                  ) : (
                    <p className="bg-slate-50 px-2.5 py-2 text-[11px] text-slate-500">{text.noTracks}</p>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => void handleIntroToggle()}
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white hover:bg-slate-700"
                  >
                    {isIntroPlaying ? <Pause size={13} /> : <Play size={13} />}
                    {isIntroPlaying ? text.introPause : text.introPlay}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleIntroReplay()}
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    <Radio size={13} /> {text.introReplay}
                  </button>
                </div>
              </div>

              <div data-tab-item className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]">
                <div className="flex items-center justify-between border-b border-slate-200 px-3 py-3">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <BellRing size={15} /> {text.notifications}
                  </span>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
                <Link
                  href="/settings"
                  className="flex items-center justify-between border-b border-slate-200 px-3 py-3"
                >
                  <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <Settings2 size={15} /> {text.settings}
                  </span>
                  <ChevronRight size={16} className="text-slate-300" />
                </Link>
                <div className="flex items-center justify-between px-3 py-3">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <Sunrise size={15} /> {text.tips}
                  </span>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </div>
            </div>
          )}
        </section>

        {isBooting && (
          <div
            ref={splashRef}
            className="absolute inset-0 z-[1200] flex items-center justify-center overflow-hidden p-6 text-white"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('https://i.postimg.cc/FzSLnvWN/page-loading-bg.png')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/55 to-black/78" />
            <div
              data-splash="panel"
              className="relative flex w-full max-w-[220px] flex-col items-center justify-center rounded-[1.4rem] border border-white/35 bg-transparent px-4 py-6"
            >
              <div data-splash="loader" className="flex flex-col items-center justify-center gap-3">
                <span className="sr-loader-ring">
                  <span className="sr-loader-orbit" />
                </span>
                <span className="sr-loader-dots">
                  <span className="sr-loader-dot" />
                  <span className="sr-loader-dot" />
                  <span className="sr-loader-dot" />
                </span>
              </div>
            </div>
          </div>
        )}

        <audio
          ref={introAudioRef}
          preload="auto"
          onLoadedMetadata={(event) => {
            const duration = event.currentTarget.duration;
            if (Number.isFinite(duration) && duration > 0) {
              setIntroDuration(duration);
            }
          }}
          onTimeUpdate={(event) => setIntroCurrentTime(event.currentTarget.currentTime)}
          onEnded={() => {
            void handleIntroEnded();
          }}
          onPause={() => setIsIntroPlaying(false)}
          onPlay={() => {
            setIsIntroPlaying(true);
            setIntroAutoplayBlocked(false);
          }}
          className="hidden"
        />

        <nav
          data-animate="nav"
          className="absolute inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-2 pb-2 pt-1 backdrop-blur"
        >
          <div className="grid grid-cols-4 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              const label = text.tabs[item.key];

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleTabChange(item.key)}
                  className={`rounded-xl px-1 py-2 text-center transition-colors ${
                    isActive ? "bg-red-50 text-red-600" : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={18} className="mx-auto" />
                  <p className="mt-1 text-[11px] font-semibold">{label}</p>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </main>
  );
}
