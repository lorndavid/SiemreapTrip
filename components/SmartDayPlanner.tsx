"use client";

import { GuideLocation } from "@/types/location";
import { createSmartDayPlan } from "@/lib/dayPlanner";
import { formatDistanceKm } from "@/lib/timeUtils";

type SmartDayPlannerProps = {
  locations: GuideLocation[];
  language: "en" | "kh";
  nowMinutes: number;
  startLat: number;
  startLng: number;
  onSelectStop: (locationId: number) => void;
};

const labels = {
  en: {
    title: "Smart Day Planner",
    subtitle: "Auto-ordered by distance + timing",
    travel: "Travel",
    visit: "Visit",
    total: "Total",
    noStops: "Add more places to generate a day route.",
  },
  kh: {
    title: "Smart Day Planner",
    subtitle: "Auto-ordered by distance + timing",
    travel: "Travel",
    visit: "Visit",
    total: "Total",
    noStops: "Add more places to generate a day route.",
  },
};

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h <= 0) {
    return `${m}m`;
  }

  return `${h}h ${m}m`;
}

export default function SmartDayPlanner({
  locations,
  language,
  nowMinutes,
  startLat,
  startLng,
  onSelectStop,
}: SmartDayPlannerProps) {
  const text = labels[language];
  const plan = createSmartDayPlan(locations, nowMinutes, startLat, startLng);

  if (plan.stops.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-500">
        {text.noStops}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {text.title}
      </p>
      <p className="mt-1 text-xs text-slate-600">{text.subtitle}</p>

      <div className="mt-2 space-y-2">
        {plan.stops.map((stop, index) => (
          <button
            key={stop.location.id}
            type="button"
            onClick={() => onSelectStop(stop.location.id)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-left hover:bg-slate-100"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-800">
                {index + 1}. {stop.location.name}
              </p>
              <p className="text-[10px] text-slate-500">
                {text.travel}: {formatDistanceKm(stop.travelKm)} • {formatMinutes(stop.travelMinutes)}
              </p>
            </div>
            <span className="rounded bg-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600">
              {text.visit}: {formatMinutes(stop.visitMinutes)}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-2 text-[11px] font-medium text-slate-600">
        {text.total}: {formatDistanceKm(plan.totalTravelKm)} •{" "}
        {formatMinutes(plan.totalTravelMinutes + plan.totalVisitMinutes)}
      </p>
    </div>
  );
}
