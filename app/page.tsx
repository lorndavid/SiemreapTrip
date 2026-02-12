"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import {
  BellRing,
  Bookmark,
  Camera,
  ChevronRight,
  Clock3,
  Hand,
  Heart,
  House,
  Languages,
  LocateFixed,
  MapPin,
  MapPinCheck,
  MapPinned,
  Navigation,
  Search,
  Settings2,
  Shirt,
  Sparkles,
  Sunrise,
  Ticket,
  Trophy,
  UserRound,
  Volume2,
  X,
} from "lucide-react";
import { locationTypes, siemReapLocations } from "@/data/locations";
import { GuideLocation, LocationMood, LocationType } from "@/types/location";
import WeatherWidget from "@/components/WeatherWidget";
import TukTukPrice from "@/components/TukTukPrice";
import CrowdHeatTimeline from "@/components/CrowdHeatTimeline";
import SmartDayPlanner from "@/components/SmartDayPlanner";
import PhotoMissions from "@/components/PhotoMissions";
import EmergencyToolkit from "@/components/EmergencyToolkit";
import TimeTravelCompare from "@/components/TimeTravelCompare";
import AmbiencePlayer from "@/components/AmbiencePlayer";
import {
  getLocationMood,
  getMoodIcon,
  getMoodLabel,
  moodOrder,
} from "@/lib/placeMeta";
import {
  calculateDistanceKm,
  formatDistanceKm,
  getCambodiaTimeSnapshot,
} from "@/lib/timeUtils";

type LanguageMode = "en" | "kh";
type AppTab = "home" | "place" | "save" | "profile";

type MapProps = {
  locations: GuideLocation[];
  activeLoc: GuideLocation | null;
  language: LanguageMode;
  onMapReady?: () => void;
};

const Map = dynamic<MapProps>(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100" />
  ),
});

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

const typeCardColor: Record<LocationType, string> = {
  Temple: "from-rose-500 to-orange-400",
  Nature: "from-emerald-500 to-lime-400",
  Dining: "from-amber-500 to-orange-500",
  Shopping: "from-violet-500 to-fuchsia-500",
  Museum: "from-cyan-500 to-blue-500",
  Culture: "from-pink-500 to-rose-500",
};

const navItems = [
  { key: "home", icon: House },
  { key: "place", icon: MapPinned },
  { key: "save", icon: Bookmark },
  { key: "profile", icon: UserRound },
] as const;

const checkInRadiusKm = 0.35;

function toGoogleMapsLink(location: GuideLocation) {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
}

function localizeBudget(budget: string, language: LanguageMode) {
  if (language === "en") {
    return budget;
  }

  const khBudgetMap: Record<string, string> = {
    "Pass required": "ត្រូវការសំបុត្រ",
    Donation: "បរិច្ចាគ",
  };

  return khBudgetMap[budget] ?? budget;
}

export default function Home() {
  const rootRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const etiquetteCardRef = useRef<HTMLDivElement | null>(null);

  const [language, setLanguage] = useState<LanguageMode>("en");
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [activeType, setActiveType] = useState<LocationType | "All">("All");
  const [activeMood, setActiveMood] = useState<LocationMood | "All">("All");
  const [query, setQuery] = useState("");
  const [selectedLocId, setSelectedLocId] = useState(siemReapLocations[0].id);
  const [savedIds, setSavedIds] = useState<number[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const raw = window.localStorage.getItem("sr_saved_ids");
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as number[];
      return Array.isArray(parsed) ? parsed.filter((id) => Number.isInteger(id)) : [];
    } catch {
      return [];
    }
  });
  const [checkedInIds, setCheckedInIds] = useState<number[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const raw = window.localStorage.getItem("sr_checkedin_ids");
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as number[];
      return Array.isArray(parsed) ? parsed.filter((id) => Number.isInteger(id)) : [];
    } catch {
      return [];
    }
  });
  const [checkingInId, setCheckingInId] = useState<number | null>(null);
  const [checkInMessage, setCheckInMessage] = useState<string>("");
  const [, setClockTick] = useState<number>(() => Date.now());
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [deferredInstallEvent, setDeferredInstallEvent] = useState<Event | null>(null);
  const [hasShownEtiquette, setHasShownEtiquette] = useState(false);
  const [isEtiquetteOpen, setIsEtiquetteOpen] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const text = uiText[language];
  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);
  const checkedInSet = useMemo(() => new Set(checkedInIds), [checkedInIds]);
  const timeSnapshot = getCambodiaTimeSnapshot(language);

  const themeClass =
    timeSnapshot.phase === "golden"
      ? "theme-golden"
      : timeSnapshot.phase === "night"
        ? "theme-night"
        : "theme-day";

  const filteredLocations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return siemReapLocations.filter((location) => {
      const typeMatch = activeType === "All" || location.type === activeType;
      const moodMatch =
        activeMood === "All" || getLocationMood(location) === activeMood;
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

      return typeMatch && moodMatch && queryMatch;
    });
  }, [activeMood, activeType, query]);

  const activeLocation =
    filteredLocations.find((location) => location.id === selectedLocId) ??
    filteredLocations[0] ??
    null;

  const savedLocations = useMemo(
    () => siemReapLocations.filter((location) => savedSet.has(location.id)),
    [savedSet],
  );

  const checkedInTempleCount = useMemo(
    () =>
      siemReapLocations.filter(
        (location) => location.type === "Temple" && checkedInSet.has(location.id),
      ).length,
    [checkedInSet],
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

  const moodCounts = useMemo(() => {
    return moodOrder.reduce(
      (acc, mood) => {
        if (mood === "All") {
          acc.All = siemReapLocations.length;
          return acc;
        }

        acc[mood] = siemReapLocations.filter(
          (location) => getLocationMood(location) === mood,
        ).length;
        return acc;
      },
      {
        All: 0,
        Epic: 0,
        Adventurous: 0,
        Peaceful: 0,
        "Local Life": 0,
        "Cultural Night": 0,
      } as Record<LocationMood | "All", number>,
    );
  }, []);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!contentRef.current) {
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
    checkedInTempleCount,
    activeLocation?.id,
  ]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClockTick(Date.now());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sr_saved_ids", JSON.stringify(savedIds));
  }, [savedIds]);

  useEffect(() => {
    window.localStorage.setItem("sr_checkedin_ids", JSON.stringify(checkedInIds));
  }, [checkedInIds]);

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
    if (!isEtiquetteOpen || !etiquetteCardRef.current) {
      return;
    }

    gsap.fromTo(
      etiquetteCardRef.current,
      { opacity: 0, y: 24, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" },
    );
  }, [isEtiquetteOpen, language]);

  const localizeName = (location: GuideLocation) =>
    language === "kh" ? location.nameKh : location.name;

  const localizeDescription = (location: GuideLocation) =>
    language === "kh" ? location.descKh : location.desc;

  const localizeHighlight = (location: GuideLocation) =>
    language === "kh" ? location.highlightKh : location.highlight;

  const localizeType = (type: LocationType) => typeLabels[type][language];
  const localizeMood = (mood: LocationMood) => getMoodLabel(mood, language);
  const moodIcon = (mood: LocationMood) => getMoodIcon(mood);
  const isGoldenHourAtAngkor = timeSnapshot.isGoldenHour && activeLocation?.id === 1;
  const plannerStartLat = userPosition?.lat ?? 13.3671;
  const plannerStartLng = userPosition?.lng ?? 103.8448;
  const installTitle =
    language === "kh" ? "Offline Trip Mode" : "Offline Trip Mode";
  const installSubtitle =
    language === "kh"
      ? "Cache map + saved places for no internet."
      : "Cache map + saved places for no internet.";
  const installAction =
    language === "kh" ? "Install app" : "Install app";
  const installReady =
    language === "kh" ? "App is install-ready on this device." : "App is install-ready on this device.";
  const installDone =
    language === "kh" ? "Already installed or unavailable on this browser." : "Already installed or unavailable on this browser.";

  const activeAmbience =
    activeLocation?.type === "Temple"
      ? "temple"
      : activeLocation?.type === "Nature"
        ? "jungle"
        : "city";

  const etiquetteTips = [
    { key: "dress", icon: Shirt, text: text.etiquetteItems.dress },
    { key: "voice", icon: Volume2, text: text.etiquetteItems.voice },
    { key: "touch", icon: Hand, text: text.etiquetteItems.touch },
    { key: "photo", icon: Camera, text: text.etiquetteItems.photo },
  ] as const;

  const handleTabChange = (nextTab: AppTab) => {
    setActiveTab(nextTab);

    if (nextTab === "place") {
      setIsMapReady(false);
      setCheckInMessage("");

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

  const handleCheckIn = (location: GuideLocation) => {
    if (!("geolocation" in navigator)) {
      setCheckInMessage(text.passportNeedLocation);
      return;
    }

    setCheckingInId(location.id);
    setCheckInMessage(text.passportChecking);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distanceKm = calculateDistanceKm(
          position.coords.latitude,
          position.coords.longitude,
          location.lat,
          location.lng,
        );

        if (distanceKm <= checkInRadiusKm) {
          setCheckedInIds((previousIds) =>
            previousIds.includes(location.id) ? previousIds : [...previousIds, location.id],
          );
          setCheckInMessage(
            language === "kh"
              ? `${text.checkInDone}: ${localizeName(location)}`
              : `${text.checkInDone}: ${localizeName(location)}`,
          );
        } else {
          setCheckInMessage(
            language === "kh"
              ? `អ្នកនៅឆ្ងាយ ${formatDistanceKm(distanceKm)}។ សូមទៅជិតជាងនេះដើម្បី Check-in។`
              : `You are ${formatDistanceKm(distanceKm)} away. Move closer to check in.`,
          );
        }

        setCheckingInId(null);
      },
      () => {
        setCheckInMessage(text.passportNeedLocation);
        setCheckingInId(null);
      },
      { enableHighAccuracy: true, timeout: 12_000 },
    );
  };

  return (
    <main
      ref={rootRef}
      className={`relative min-h-screen bg-[var(--screen-bg)] px-3 py-4 transition-colors md:px-6 ${themeClass}`}
    >
      <div
        className={`mx-auto flex h-[calc(100vh-2rem)] w-full max-w-[460px] flex-col overflow-hidden rounded-[34px] border border-slate-200/80 bg-[var(--phone-bg)] shadow-[0_28px_60px_-30px_rgba(15,23,42,0.55)] ${language === "kh" ? "lang-kh" : "lang-en"}`}
      >
        <header
          data-animate="top"
          className={`relative overflow-hidden rounded-b-[32px] bg-gradient-to-br px-5 pb-5 pt-6 text-white ${
            timeSnapshot.phase === "golden"
              ? "from-orange-500 via-amber-500 to-purple-600"
              : timeSnapshot.phase === "night"
                ? "from-slate-900 via-indigo-900 to-purple-900"
                : "from-red-600 via-rose-600 to-orange-500"
          }`}
        >
          <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-white/10" />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-100">
                {text.brand}
              </p>
              <h1 className="app-heading mt-1 text-[1.55rem] leading-none">
                {text.tabs[activeTab]}
              </h1>
              <p className="mt-1.5 text-xs text-red-100">{text.tagline}</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium">
                <Sunrise size={12} />
                <span>{text.sunsetTracker}</span>
                <span className="font-semibold">{timeSnapshot.formattedTime}</span>
              </div>
              <p className="mt-1 text-[11px] text-red-100">
                {timeSnapshot.formattedDate} • {text.goldenHour}: {text.goldenRange}
              </p>
            </div>

            <div className="rounded-full bg-white/20 p-1 backdrop-blur">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  language === "en" ? "bg-white text-red-600" : "text-white"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("kh")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  language === "kh" ? "bg-white text-red-600" : "text-white"
                }`}
              >
                KH
              </button>
            </div>
          </div>
        </header>

        <section ref={contentRef} className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
          {activeTab === "home" && (
            <div className="space-y-3">
              <div
                data-tab-item
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]"
              >
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                  <Sparkles size={12} /> {text.mapLive}
                </div>
                <p className="text-sm leading-relaxed text-slate-700">{text.welcome}</p>
                <button
                  type="button"
                  onClick={() => handleTabChange("place")}
                  className="mt-3 inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
                >
                  {text.startExplore} <ChevronRight size={14} />
                </button>
              </div>

              <div
                data-tab-item
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]"
              >
                <p className="app-heading text-base text-slate-900">{text.aboutTitle}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{text.aboutDesc}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    <MapPinned size={11} className="mr-1 inline-block" />
                    {text.mapLive}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    <Languages size={11} className="mr-1 inline-block" />
                    EN / KH
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    <Heart size={11} className="mr-1 inline-block" />
                    {text.savedPlaces}
                  </span>
                </div>
              </div>

              <div data-tab-item className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {text.totalPlaces}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{siemReapLocations.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {text.savedPlaces}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{savedIds.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {text.sunriseSpot}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {language === "kh" ? "អង្គរវត្ត" : "Angkor Wat"}
                  </p>
                </div>
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
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-[0_14px_30px_-26px_rgba(15,23,42,0.65)] transition-transform hover:-translate-y-0.5"
                  >
                    <div
                      className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white ${typeCardColor[location.type]}`}
                    >
                      {localizeType(location.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {localizeName(location)}
                      </p>
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
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {text.passportTitle}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-700">
                      {text.passportProgress}: {checkedInTempleCount}/5
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
                    <Trophy size={12} /> {checkedInTempleCount >= 5 ? "100%" : `${checkedInTempleCount * 20}%`}
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                    style={{ width: `${Math.min((checkedInTempleCount / 5) * 100, 100)}%` }}
                  />
                </div>

                <p className="mt-2 text-[11px] text-slate-600">
                  {checkedInTempleCount >= 5 ? text.passportUnlocked : text.passportLocked}
                </p>
                {checkedInTempleCount >= 5 && (
                  <p className="mt-1 rounded-xl bg-emerald-50 px-2.5 py-2 text-[11px] text-emerald-700">
                    {text.secretTip}
                  </p>
                )}
                {checkInMessage && (
                  <p className="mt-2 rounded-xl bg-slate-100 px-2.5 py-1.5 text-[11px] text-slate-600">
                    {checkInMessage}
                  </p>
                )}
              </div>

              {isGoldenHourAtAngkor && (
                <div
                  data-tab-item
                  className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-100 via-orange-100 to-violet-100 p-3 text-[12px] font-semibold text-amber-900 shadow-[0_16px_30px_-24px_rgba(245,158,11,0.75)]"
                >
                  {text.goldenNow}
                </div>
              )}

              <div data-tab-item>
                <PhotoMissions
                  locations={siemReapLocations}
                  checkedInIds={checkedInIds}
                  language={language}
                />
              </div>

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
                </div>

                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {text.moods}
                </p>
                <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
                  {moodOrder.map((mood) => {
                    const isActive = activeMood === mood;
                    const label =
                      mood === "All" ? text.all : `${moodIcon(mood)} ${localizeMood(mood)}`;

                    return (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => setActiveMood(mood)}
                        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isActive
                            ? "border-violet-600 bg-violet-600 text-white"
                            : "border-slate-300 bg-white text-slate-600"
                        }`}
                      >
                        {label} ({moodCounts[mood]})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                data-tab-item
                className="relative h-[255px] overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <Map
                  locations={filteredLocations}
                  activeLoc={activeLocation}
                  language={language}
                  onMapReady={() => setIsMapReady(true)}
                />

                <div className="absolute left-2 top-2 z-[455]">
                  <AmbiencePlayer ambience={activeAmbience} language={language} />
                </div>
                <div className="pointer-events-none absolute right-2 top-2 z-[455] w-[170px]">
                  <WeatherWidget language={language} />
                </div>
                <div className="pointer-events-none absolute bottom-2 left-2 z-[455] rounded-xl border border-white/50 bg-white/72 px-2 py-1.5 text-[10px] font-medium text-slate-700 backdrop-blur">
                  <span className="mr-2 inline-flex items-center gap-1">
                    <span className="inline-block h-0.5 w-4 bg-amber-400" /> Sunrise path
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-0.5 w-4 bg-violet-500" /> Sunset path
                  </span>
                </div>

                {!isMapReady && (
                  <div className="absolute inset-0 z-[450] flex items-center justify-center bg-white/78 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="mx-auto mb-2 h-12 w-12 rounded-full border-4 border-red-100 border-t-red-500 animate-spin" />
                      <p className="text-xs font-semibold text-slate-700">{text.mapLoadingTitle}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{text.mapLoadingDesc}</p>
                    </div>
                  </div>
                )}

                {isEtiquetteOpen && (
                  <div className="absolute inset-0 z-[500] flex items-center justify-center bg-slate-900/38 p-3 backdrop-blur-[2px]">
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

              <div data-tab-item>
                <SmartDayPlanner
                  locations={filteredLocations}
                  language={language}
                  nowMinutes={timeSnapshot.totalMinutes}
                  startLat={plannerStartLat}
                  startLng={plannerStartLng}
                  onSelectStop={(locationId) => setSelectedLocId(locationId)}
                />
              </div>

              {activeLocation?.id === 1 && (
                <div data-tab-item>
                  <TimeTravelCompare language={language} />
                </div>
              )}

              <div data-tab-item className="space-y-2">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((location) => {
                    const isSaved = savedSet.has(location.id);
                    const isActive = activeLocation?.id === location.id;
                    const mood = getLocationMood(location);
                    const isCheckedIn = checkedInSet.has(location.id);
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
                        className={`rounded-2xl border bg-white shadow-[0_14px_28px_-24px_rgba(15,23,42,0.65)] ${
                          isActive ? "border-red-400" : "border-slate-200"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedLocId(location.id)}
                          className="w-full px-3 pb-1 pt-3 text-left"
                        >
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {localizeName(location)}
                            </p>
                            <MapPin size={14} className="text-red-500" />
                          </div>
                          <p className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                            <span>{moodIcon(mood)}</span>
                            {localizeMood(mood)}
                          </p>
                          <p className="line-clamp-2 text-xs text-slate-600">
                            {localizeDescription(location)}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                              <Clock3 size={11} /> {location.duration}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                              {text.budget}: {localizeBudget(location.budget, language)}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] font-medium text-slate-500">
                            {text.highlight}: {localizeHighlight(location)}
                          </p>
                          {distanceKm !== null && (
                            <p className="mt-1 text-[11px] text-slate-500">
                              {language === "kh" ? "ចម្ងាយ" : "Distance"}:{" "}
                              {formatDistanceKm(distanceKm)}
                            </p>
                          )}
                        </button>

                        {isActive && (
                          <div className="px-3 pb-2">
                            <TukTukPrice
                              destinationLat={location.lat}
                              destinationLng={location.lng}
                              userLat={userPosition?.lat ?? null}
                              userLng={userPosition?.lng ?? null}
                              language={language}
                            />
                            <CrowdHeatTimeline location={location} language={language} />
                          </div>
                        )}

                        <div className="flex items-center justify-between px-3 pb-3 pt-2">
                          <a
                            href={toGoogleMapsLink(location)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            <Navigation size={12} /> {text.directions}
                          </a>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCheckIn(location)}
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                                isCheckedIn
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-blue-600 text-white hover:bg-blue-700"
                              }`}
                            >
                              {checkingInId === location.id ? (
                                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              ) : isCheckedIn ? (
                                <MapPinCheck size={12} />
                              ) : (
                                <LocateFixed size={12} />
                              )}
                              {isCheckedIn ? text.checkInDone : text.passportAction}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleSave(location.id)}
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                                isSaved
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-red-600 text-white hover:bg-red-700"
                              }`}
                            >
                              {isSaved ? (
                                <Heart size={12} fill="currentColor" />
                              ) : (
                                <Ticket size={12} />
                              )}
                              {isSaved ? text.saved : text.save}
                            </button>
                          </div>
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
                    <p className="text-sm font-semibold text-slate-900">{localizeName(location)}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                      {localizeDescription(location)}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLocId(location.id);
                          handleTabChange("place");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-700"
                      >
                        <MapPinned size={12} /> {text.openInPlaces}
                      </button>
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
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]"
              >
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white">
                    <UserRound size={22} />
                  </div>
                  <div>
                    <h2 className="app-heading text-base text-slate-900">{text.profileName}</h2>
                    <p className="text-xs text-slate-600">{text.profileRole}</p>
                  </div>
                </div>
              </div>

              <div data-tab-item className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {text.language}
                </p>
                <div className="mt-2 inline-flex rounded-full bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      language === "en" ? "bg-red-600 text-white" : "text-slate-600"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("kh")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      language === "kh" ? "bg-red-600 text-white" : "text-slate-600"
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

              <div data-tab-item className="space-y-2">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <BellRing size={15} /> {text.notifications}
                  </span>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <Settings2 size={15} /> {text.settings}
                  </span>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <Sunrise size={15} /> {text.tips}
                  </span>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </div>
            </div>
          )}
        </section>

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
