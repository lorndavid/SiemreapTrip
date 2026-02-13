"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import {
  ArrowLeft,
  Clock3,
  Heart,
  Languages,
  Navigation,
  Sparkles,
  Sunrise,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { locationImageById, siemReapLocations } from "@/data/locations";
import { GuideLocation } from "@/types/location";
import {
  CambodiaTimeSnapshot,
  calculateDistanceKm,
  formatDistanceKm,
  getCambodiaTimeSnapshot,
} from "@/lib/timeUtils";
import WeatherWidget from "@/components/WeatherWidget";
import AmbiencePlayer from "@/components/AmbiencePlayer";

type LanguageMode = "en" | "kh";
type AppPalette = "man" | "woman" | "mix";
type ScrollMode = "smooth" | "auto";
type MotionMode = "dynamic" | "minimal";

function parseLanguage(raw: string | null): LanguageMode {
  return raw === "kh" ? "kh" : "en";
}

type MapProps = {
  locations: GuideLocation[];
  activeLoc: GuideLocation | null;
  language: LanguageMode;
  onMapReady?: () => void;
};

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

const Map = dynamic<MapProps>(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100" />
  ),
});

const labels = {
  en: {
    back: "Back",
    openInMaps: "Google Maps",
    fullMap: "Back to List",
    nearby: "Nearby picks",
    budget: "Budget",
    bestTime: "Best time",
    duration: "Duration",
    notFound: "Location not found",
    goHome: "Go home",
    wowTitle: "Travel Tip",
    wowBody: "Use early morning for cooler weather and cleaner photos around the temple zone.",
    wowAction: "Explore",
    distance: "Distance",
  },
  kh: {
    back: "Back",
    openInMaps: "Google Maps",
    fullMap: "Back to List",
    nearby: "Nearby picks",
    budget: "Budget",
    bestTime: "Best time",
    duration: "Duration",
    notFound: "Location not found",
    goHome: "Go home",
    wowTitle: "Travel Tip",
    wowBody: "Use early morning for cooler weather and cleaner photos around the temple zone.",
    wowAction: "Explore",
    distance: "Distance",
  },
};

function toGoogleMapsLink(location: GuideLocation) {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
}

export default function PlaceDetailPage() {
  const params = useParams<{ id: string }>();
  const placeId = Number(params?.id);
  const hasLoadedSavedIdsRef = useRef(false);
  const [language, setLanguage] = useState<LanguageMode>("en");
  const [timeSnapshot, setTimeSnapshot] = useState<CambodiaTimeSnapshot>(
    createInitialTimeSnapshot,
  );
  const [appPalette, setAppPalette] = useState<AppPalette>("mix");
  const [scrollMode, setScrollMode] = useState<ScrollMode>("smooth");
  const [motionMode, setMotionMode] = useState<MotionMode>("dynamic");
  const [isMapReady, setIsMapReady] = useState(false);
  const [isTipOpen, setIsTipOpen] = useState(true);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);

  const text = labels[language];
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

  const location = useMemo(
    () => siemReapLocations.find((item) => item.id === placeId) ?? null,
    [placeId],
  );

  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);

  const nearbyLocations = useMemo(() => {
    if (!location) {
      return [];
    }

    return siemReapLocations
      .filter((item) => item.id !== location.id)
      .map((item) => ({
        item,
        distance: calculateDistanceKm(location.lat, location.lng, item.lat, item.lng),
      }))
      .sort((left, right) => left.distance - right.distance)
      .slice(0, 6);
  }, [location]);

  const distanceFromUser =
    userPosition && location
      ? calculateDistanceKm(userPosition.lat, userPosition.lng, location.lat, location.lng)
      : null;

  const activeAmbience =
    location?.type === "Temple" ? "temple" : location?.type === "Nature" ? "jungle" : "city";

  useEffect(() => {
    const initialSavedIds = parseSavedIds(window.localStorage.getItem("sr_saved_ids"));

    queueMicrotask(() => {
      setSavedIds(initialSavedIds);
      hasLoadedSavedIdsRef.current = true;
    });
  }, []);

  useEffect(() => {
    const storedLanguage = parseLanguage(window.localStorage.getItem("sr_language"));
    const storedPalette = parsePalette(window.localStorage.getItem("sr_app_palette"));
    const storedScrollMode = parseScrollMode(window.localStorage.getItem("sr_scroll_mode"));
    const storedMotionMode = parseMotionMode(window.localStorage.getItem("sr_motion_mode"));

    queueMicrotask(() => {
      setLanguage(storedLanguage);
      setAppPalette(storedPalette);
      setScrollMode(storedScrollMode);
      setMotionMode(storedMotionMode);
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sr_language", language);
  }, [language]);

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
    if (!hasLoadedSavedIdsRef.current) {
      return;
    }
    window.localStorage.setItem("sr_saved_ids", JSON.stringify(savedIds));
  }, [savedIds]);

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
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: 240_000 },
    );
  }, []);

  useEffect(() => {
    const updateTime = () => {
      setTimeSnapshot(getCambodiaTimeSnapshot(language));
    };

    updateTime();
    const timer = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(timer);
  }, [language]);

  useEffect(() => {
    if (!isTipOpen || !tipRef.current) {
      return;
    }

    if (motionMode === "minimal") {
      return;
    }

    gsap.fromTo(
      tipRef.current,
      { opacity: 0, y: 20, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: "power3.out" },
    );
  }, [isTipOpen, motionMode]);

  const toggleSave = (locationId: number) => {
    setSavedIds((previousSaved) =>
      previousSaved.includes(locationId)
        ? previousSaved.filter((id) => id !== locationId)
        : [...previousSaved, locationId],
    );
  };

  if (!location) {
    return (
      <main className="theme-day flex min-h-screen items-center justify-center bg-[var(--screen-bg)] px-4">
        <div className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-5 text-center">
          <p className="text-base font-semibold text-slate-900">{text.notFound}</p>
          <Link
            href="/"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            <ArrowLeft size={14} /> {text.goHome}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`relative min-h-screen overflow-hidden bg-[var(--screen-bg)] ${themeClass} ${paletteClass}`}>
      <div className="absolute inset-0 z-0">
        <Map
          locations={siemReapLocations}
          activeLoc={location}
          language={language}
          onMapReady={() => setIsMapReady(true)}
        />
      </div>

      <div className="absolute inset-x-0 top-0 z-[500] px-3 pt-3">
        <div className="rounded-2xl border border-white/65 bg-white/86 p-2.5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700"
            >
              <ArrowLeft size={12} /> {text.back}
            </Link>

            <Image src="/logo-travel.png" alt="Angkor Go" width={110} height={32} className="h-7 w-auto object-contain" />

            <button
              type="button"
              onClick={() => setLanguage((previous) => (previous === "en" ? "kh" : "en"))}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-transparent px-2 py-1 text-[10px] font-semibold text-slate-700"
            >
              <Languages size={12} /> {language === "en" ? "KH" : "EN"}
            </button>
          </div>
        </div>
      </div>

      <div className="absolute right-3 top-[84px] z-[500]">
        <AmbiencePlayer ambience={activeAmbience} language={language} />
      </div>
      <div className="pointer-events-none absolute right-3 top-[126px] z-[500] w-[160px]">
        <WeatherWidget language={language} />
      </div>

      {!isMapReady && (
        <div className="absolute inset-0 z-[480] flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto mb-2 h-12 w-12 animate-spin rounded-full border-4 border-red-100 border-t-red-500" />
            <p className="text-xs font-semibold text-slate-700">Loading map...</p>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[490] h-44 bg-gradient-to-t from-slate-950/60 to-transparent" />

      <div className="absolute inset-x-0 bottom-3 z-[500] px-3">
        <article className="rounded-2xl border border-white/65 bg-white/90 p-3 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.85)] backdrop-blur-xl">
          <div className="mb-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <Image
              src={locationImageById[location.id]?.src ?? "https://i.postimg.cc/FzSLnvWN/page-loading-bg.png"}
              alt={`${location.name} - Siem Reap`}
              width={720}
              height={300}
              loading="lazy"
              unoptimized
              referrerPolicy="no-referrer"
              className="h-28 w-full object-cover"
            />
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {location.type}
              </p>
              <h1 className="truncate text-base font-bold text-slate-900">
                {language === "kh" ? location.nameKh : location.name}
              </h1>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {locationImageById[location.id]?.place ?? "Siem Reap, Cambodia"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleSave(location.id)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                savedSet.has(location.id) ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              <Heart size={14} fill={savedSet.has(location.id) ? "currentColor" : "none"} />
            </button>
          </div>

          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
            {language === "kh" ? location.descKh : location.desc}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              <Clock3 size={11} /> {text.duration}: {location.duration}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              <Sunrise size={11} /> {text.bestTime}: {location.bestTime}
            </span>
            {distanceFromUser !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                {text.distance}: {formatDistanceKm(distanceFromUser)}
              </span>
            )}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <a
              href={toGoogleMapsLink(location)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white hover:bg-slate-700"
            >
              <Navigation size={12} /> {text.openInMaps}
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
            >
              {text.fullMap}
            </Link>
          </div>
        </article>

        <div className="mt-2 rounded-2xl border border-white/65 bg-white/80 p-2 backdrop-blur-lg">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {text.nearby}
          </p>
          <div className="mt-1 flex gap-2 overflow-x-auto pb-1">
            {nearbyLocations.map(({ item, distance }) => (
              <Link
                key={item.id}
                href={`/place/${item.id}`}
                className="shrink-0 rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700"
              >
                {language === "kh" ? item.nameKh : item.name} · {formatDistanceKm(distance)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {isTipOpen && (
        <div className="absolute inset-0 z-[620] flex items-center justify-center bg-slate-900/38 p-3 backdrop-blur-[2px]">
          <div
            ref={tipRef}
            className="w-full max-w-[320px] rounded-2xl border border-white/65 bg-white p-4 shadow-[0_22px_45px_-24px_rgba(15,23,42,0.7)]"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-600">
                  <Sparkles size={12} className="mr-1 inline-block" /> {text.wowTitle}
                </p>
                <h3 className="app-heading mt-0.5 text-base text-slate-900">
                  {language === "kh" ? location.nameKh : location.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTipOpen(false)}
                className="rounded-full bg-slate-100 p-1 text-slate-500 hover:bg-slate-200"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-slate-600">{text.wowBody}</p>

            <button
              type="button"
              onClick={() => setIsTipOpen(false)}
              className="mt-3 w-full rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              {text.wowAction}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
