"use client";

import ReactCompareImage from "react-compare-image";

type TimeTravelCompareProps = {
  language: "en" | "kh";
};

const labels = {
  en: {
    title: "Time Travel Slider",
    hint: "Drag to compare 1920 vs today",
  },
  kh: {
    title: "Time Travel Slider",
    hint: "Drag to compare 1920 vs today",
  },
};

export default function TimeTravelCompare({ language }: TimeTravelCompareProps) {
  const text = labels[language];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{text.title}</p>
      <div className="mt-2 overflow-hidden rounded-xl">
        <ReactCompareImage
          leftImage="/angkor-1920.svg"
          rightImage="/angkor-2024.svg"
          sliderLineColor="#ef4444"
          aspectRatio="wider"
        />
      </div>
      <p className="mt-1 text-center text-[11px] italic text-slate-500">{text.hint}</p>
    </div>
  );
}
