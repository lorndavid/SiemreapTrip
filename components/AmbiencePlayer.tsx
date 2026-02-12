"use client";

import { useEffect, useRef, useState } from "react";

type AmbienceKind = "temple" | "jungle" | "city";

type AmbiencePlayerProps = {
  ambience: AmbienceKind;
  language: "en" | "kh";
};

const labels = {
  en: {
    play: "Play ambience",
    stop: "Stop ambience",
  },
  kh: {
    play: "Play ambience",
    stop: "Stop ambience",
  },
};

function createOscillatorSet(context: AudioContext, kind: AmbienceKind) {
  const masterGain = context.createGain();
  masterGain.gain.value = 0.0001;
  masterGain.connect(context.destination);

  const tone1 = context.createOscillator();
  tone1.type = kind === "city" ? "triangle" : "sine";
  tone1.frequency.value = kind === "temple" ? 196 : kind === "jungle" ? 240 : 180;

  const tone2 = context.createOscillator();
  tone2.type = "sine";
  tone2.frequency.value = kind === "temple" ? 261 : kind === "jungle" ? 320 : 220;

  const gain1 = context.createGain();
  const gain2 = context.createGain();
  gain1.gain.value = kind === "temple" ? 0.08 : 0.05;
  gain2.gain.value = kind === "temple" ? 0.04 : 0.03;

  tone1.connect(gain1).connect(masterGain);
  tone2.connect(gain2).connect(masterGain);

  tone1.start();
  tone2.start();

  return {
    masterGain,
    stop: () => {
      tone1.stop();
      tone2.stop();
      tone1.disconnect();
      tone2.disconnect();
      gain1.disconnect();
      gain2.disconnect();
      masterGain.disconnect();
    },
  };
}

export default function AmbiencePlayer({ ambience, language }: AmbiencePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<{ ctx: AudioContext; stop: () => void } | null>(null);
  const text = labels[language];

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.stop();
        audioRef.current.ctx.close();
        audioRef.current = null;
      }
    };
  }, []);

  const toggle = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.stop();
      audioRef.current.ctx.close();
      audioRef.current = null;
      setIsPlaying(false);
      return;
    }

    const ctx = new AudioContext();
    const ambienceSet = createOscillatorSet(ctx, ambience);
    ambienceSet.masterGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.9);
    audioRef.current = { ctx, stop: ambienceSet.stop };
    setIsPlaying(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-base shadow-sm transition-transform hover:scale-105"
      aria-label={isPlaying ? text.stop : text.play}
      title={isPlaying ? text.stop : text.play}
    >
      🎧
    </button>
  );
}
