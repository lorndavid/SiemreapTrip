"use client";

import { GuideLocation, LocationMood } from "@/types/location";
import { getLocationMood } from "@/lib/placeMeta";

type PhotoMissionsProps = {
  locations: GuideLocation[];
  checkedInIds: number[];
  language: "en" | "kh";
};

type Mission = {
  id: string;
  title: string;
  done: boolean;
};

const labels = {
  en: {
    title: "Photo Challenge Missions",
    done: "Unlocked",
    todo: "In progress",
  },
  kh: {
    title: "Photo Challenge Missions",
    done: "Unlocked",
    todo: "In progress",
  },
};

const requiredMoods: LocationMood[] = ["Epic", "Adventurous", "Peaceful"];

export default function PhotoMissions({
  locations,
  checkedInIds,
  language,
}: PhotoMissionsProps) {
  const text = labels[language];
  const checkedInSet = new Set(checkedInIds);
  const checkedInLocations = locations.filter((location) => checkedInSet.has(location.id));
  const checkedInTempleCount = checkedInLocations.filter(
    (location) => location.type === "Temple",
  ).length;
  const uniqueMoodCount = new Set(
    checkedInLocations.map((location) => getLocationMood(location)),
  ).size;
  const hasMoodPack = requiredMoods.every((mood) =>
    checkedInLocations.some((location) => getLocationMood(location) === mood),
  );
  const hasNightCultureShot = checkedInLocations.some(
    (location) => getLocationMood(location) === "Cultural Night",
  );

  const missions: Mission[] = [
    { id: "temple-3", title: "Temple Hunter: check-in 3 temples", done: checkedInTempleCount >= 3 },
    { id: "mood-3", title: "Mood Collector: capture 3 different moods", done: uniqueMoodCount >= 3 },
    { id: "gold-pack", title: "Golden Pack: Epic + Adventurous + Peaceful", done: hasMoodPack },
    { id: "night-life", title: "Night Story: check-in one Cultural Night stop", done: hasNightCultureShot },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{text.title}</p>
      <div className="mt-2 space-y-1.5">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-[11px] ${
              mission.done ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-600"
            }`}
          >
            <span>{mission.title}</span>
            <span className="font-semibold">{mission.done ? text.done : text.todo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
