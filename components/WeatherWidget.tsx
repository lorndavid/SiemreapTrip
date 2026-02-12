"use client";

import { useEffect, useState } from "react";
import { CloudSun, Wind } from "lucide-react";
import { fetchSiemReapWeather, WeatherSnapshot } from "@/lib/weather";

type WeatherWidgetProps = {
  language: "en" | "kh";
};

const labels = {
  en: {
    title: "Siem Reap Weather",
    loading: "Loading weather...",
    wind: "Wind",
  },
  kh: {
    title: "អាកាសធាតុសៀមរាប",
    loading: "កំពុងផ្ទុកអាកាសធាតុ...",
    wind: "ខ្យល់",
  },
};

export default function WeatherWidget({ language }: WeatherWidgetProps) {
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadWeather = async () => {
      try {
        const weather = await fetchSiemReapWeather();
        if (!isCancelled) {
          setSnapshot(weather);
        }
      } catch {
        if (!isCancelled) {
          setSnapshot(null);
        }
      }
    };

    loadWeather();
    const timer = window.setInterval(loadWeather, 1000 * 60 * 15);

    return () => {
      isCancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const text = labels[language];

  return (
    <div className="rounded-2xl border border-white/50 bg-white/62 p-3 shadow-[0_16px_30px_-22px_rgba(15,23,42,0.6)] backdrop-blur-md">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
        <CloudSun size={12} className="mr-1 inline-block text-amber-500" />
        {text.title}
      </p>

      {snapshot ? (
        <>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-xl">{snapshot.icon}</span>
            <p className="text-xl font-bold text-slate-900">{Math.round(snapshot.temperature)}°C</p>
          </div>
          <p className="text-[11px] font-medium text-slate-600">{snapshot.conditionLabel}</p>
          <p className="mt-1 text-[11px] text-slate-500">
            <Wind size={11} className="mr-1 inline-block" />
            {text.wind}: {Math.round(snapshot.windSpeed)} km/h
          </p>
        </>
      ) : (
        <p className="mt-2 text-xs text-slate-500">{text.loading}</p>
      )}
    </div>
  );
}
