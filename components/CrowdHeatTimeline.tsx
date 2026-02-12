"use client";

import { GuideLocation } from "@/types/location";
import { getCrowdHeatTimeline } from "@/lib/crowd";

type CrowdHeatTimelineProps = {
  location: GuideLocation;
  language: "en" | "kh";
};

const labels = {
  en: {
    title: "Crowd / Heat Timeline",
    crowd: "Crowd",
    heat: "Heat",
    quiet: "Quiet",
    busy: "Busy",
    cool: "Cool",
    hot: "Hot",
  },
  kh: {
    title: "Crowd / Heat Timeline",
    crowd: "Crowd",
    heat: "Heat",
    quiet: "Quiet",
    busy: "Busy",
    cool: "Cool",
    hot: "Hot",
  },
};

function hourLabel(hour: number): string {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour > 12 ? hour - 12 : hour;
  return `${h}${suffix}`;
}

export default function CrowdHeatTimeline({ location, language }: CrowdHeatTimelineProps) {
  const text = labels[language];
  const timeline = getCrowdHeatTimeline(location);

  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {text.title}
      </p>

      <div className="mt-2 grid grid-cols-5 gap-1">
        {timeline.filter((point) => point.hour % 3 === 0).map((point) => (
          <div key={point.hour} className="rounded-lg bg-white p-1.5">
            <p className="text-[10px] font-semibold text-slate-500">{hourLabel(point.hour)}</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${Math.round(point.crowd * 100)}%` }}
              />
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-orange-500"
                style={{ width: `${Math.round(point.heat * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
        <span>{text.crowd}: {text.quiet} → {text.busy}</span>
        <span>{text.heat}: {text.cool} → {text.hot}</span>
      </div>
    </div>
  );
}
