"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Headphones, Settings2, Sparkles } from "lucide-react";

type LanguageMode = "en" | "kh";
type AppPalette = "man" | "woman" | "mix";
type AudioBehavior = "background" | "stop";
type ScrollMode = "smooth" | "auto";
type MotionMode = "dynamic" | "minimal";

function parseLanguage(raw: string | null): LanguageMode {
  return raw === "kh" ? "kh" : "en";
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

const text = {
  en: {
    title: "App Settings",
    subtitle: "Customize your style and motion for a cleaner travel experience.",
    themeTitle: "Theme Palette",
    themeHint: "Apply your favorite colors across all pages.",
    themeMan: "Man",
    themeWoman: "Woman",
    themeMix: "Mix",
    scrollTitle: "Scroll Style",
    scrollSmooth: "Smooth",
    scrollAuto: "Normal",
    motionTitle: "Animation Mode",
    motionDynamic: "Dynamic",
    motionMinimal: "Minimal",
    audioTitle: "Audio in Background",
    audioModeBackground: "Keep Playing",
    audioModeStop: "Auto Stop",
    audioHint:
      "Background tab can keep playing if enabled, but full browser close will still stop sound.",
    back: "Back",
  },
  kh: {
    title: "App Settings",
    subtitle: "Customize your style and motion for a cleaner travel experience.",
    themeTitle: "Theme Palette",
    themeHint: "Apply your favorite colors across all pages.",
    themeMan: "Man",
    themeWoman: "Woman",
    themeMix: "Mix",
    scrollTitle: "Scroll Style",
    scrollSmooth: "Smooth",
    scrollAuto: "Normal",
    motionTitle: "Animation Mode",
    motionDynamic: "Dynamic",
    motionMinimal: "Minimal",
    audioTitle: "Audio in Background",
    audioModeBackground: "Keep Playing",
    audioModeStop: "Auto Stop",
    audioHint:
      "Background tab can keep playing if enabled, but full browser close will still stop sound.",
    back: "Back",
  },
} as const;

export default function SettingsPage() {
  const [language, setLanguage] = useState<LanguageMode>("en");
  const [appPalette, setAppPalette] = useState<AppPalette>("mix");
  const [audioBehavior, setAudioBehavior] = useState<AudioBehavior>("stop");
  const [scrollMode, setScrollMode] = useState<ScrollMode>("smooth");
  const [motionMode, setMotionMode] = useState<MotionMode>("dynamic");

  const paletteClass =
    appPalette === "man"
      ? "palette-man"
      : appPalette === "woman"
        ? "palette-woman"
        : "palette-mix";

  const ui = text[language];

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

  return (
    <main className={`relative min-h-screen bg-[var(--screen-bg)] px-3 py-4 md:px-6 ${paletteClass}`}>
      <div
        className={`relative mx-auto flex h-[calc(100vh-2rem)] w-full max-w-[460px] flex-col overflow-hidden rounded-[34px] border border-slate-200/80 bg-[var(--phone-bg)] shadow-[0_28px_60px_-30px_rgba(15,23,42,0.55)] ${language === "kh" ? "lang-kh" : "lang-en"}`}
      >
        <header className="relative overflow-hidden rounded-b-[32px] px-5 pb-5 pt-5 text-white">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://i.postimg.cc/qvsdBKK4/vecteezy-asean-scenery-country-background-of-cambodia-with-angkor-wat-5644005-1.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/52 via-slate-900/36 to-slate-950/66" />
          <div className="relative z-10 flex items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-xl border border-white/45 bg-transparent px-2.5 py-1.5 text-[11px] font-semibold"
            >
              <ArrowLeft size={12} /> {ui.back}
            </Link>

            <Image
              src="/logo-travel.png"
              alt="Angkor Go"
              width={178}
              height={56}
              priority
              className="h-12 w-auto object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.3)]"
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

          <div className="relative z-10 mt-3">
            <p className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-transparent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90">
              <Settings2 size={11} /> {ui.title}
            </p>
            <p className="mt-1 text-xs text-white/85">{ui.subtitle}</p>
          </div>
        </header>

        <section className="flex-1 space-y-3 overflow-y-auto px-4 pb-24 pt-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {ui.themeTitle}
            </p>
            <p className="mt-1 text-xs text-slate-600">{ui.themeHint}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAppPalette("man")}
                className={`rounded-xl border px-2 py-2 text-[11px] font-semibold transition-colors ${
                  appPalette === "man"
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {ui.themeMan}
              </button>
              <button
                type="button"
                onClick={() => setAppPalette("woman")}
                className={`rounded-xl border px-2 py-2 text-[11px] font-semibold transition-colors ${
                  appPalette === "woman"
                    ? "border-rose-600 bg-rose-600 text-white"
                    : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {ui.themeWoman}
              </button>
              <button
                type="button"
                onClick={() => setAppPalette("mix")}
                className={`rounded-xl border px-2 py-2 text-[11px] font-semibold transition-colors ${
                  appPalette === "mix"
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {ui.themeMix}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {ui.scrollTitle}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScrollMode("smooth")}
                  className={`rounded-xl border px-3 py-2 text-[11px] font-semibold transition-colors ${
                    scrollMode === "smooth"
                      ? "border-cyan-600 bg-cyan-600 text-white"
                      : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {ui.scrollSmooth}
                </button>
                <button
                  type="button"
                  onClick={() => setScrollMode("auto")}
                  className={`rounded-xl border px-3 py-2 text-[11px] font-semibold transition-colors ${
                    scrollMode === "auto"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {ui.scrollAuto}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {ui.motionTitle}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMotionMode("dynamic")}
                  className={`rounded-xl border px-3 py-2 text-[11px] font-semibold transition-colors ${
                    motionMode === "dynamic"
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {ui.motionDynamic}
                </button>
                <button
                  type="button"
                  onClick={() => setMotionMode("minimal")}
                  className={`rounded-xl border px-3 py-2 text-[11px] font-semibold transition-colors ${
                    motionMode === "minimal"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {ui.motionMinimal}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]">
            <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              <Headphones size={12} /> {ui.audioTitle}
            </p>
            <p className="mt-1 text-xs text-slate-600">{ui.audioHint}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAudioBehavior("background")}
                className={`rounded-xl border px-3 py-2 text-[11px] font-semibold transition-colors ${
                  audioBehavior === "background"
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {ui.audioModeBackground}
              </button>
              <button
                type="button"
                onClick={() => setAudioBehavior("stop")}
                className={`rounded-xl border px-3 py-2 text-[11px] font-semibold transition-colors ${
                  audioBehavior === "stop"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {ui.audioModeStop}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-white p-4">
            <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
              <Sparkles size={12} /> Live Preview
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Your selections are saved instantly and apply across Home, Place, and Music pages.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
