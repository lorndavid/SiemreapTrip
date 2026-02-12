"use client";

import { calculateDistanceKm, formatDistanceKm } from "@/lib/timeUtils";

type TukTukPriceProps = {
  destinationLat: number;
  destinationLng: number;
  userLat: number | null;
  userLng: number | null;
  language: "en" | "kh";
};

type FareEstimate = {
  distanceKm: number;
  totalUsd: number;
  totalRiel: number;
};

function calculateFare(distanceKm: number): FareEstimate {
  const basePrice = 1;
  const lowRatePerKm = 0.75;
  const highRatePerKm = 1.0;

  const dynamicRate = distanceKm > 8 ? highRatePerKm : lowRatePerKm;
  const totalUsd = Number((basePrice + distanceKm * dynamicRate).toFixed(2));
  const totalRiel = Math.round((totalUsd * 4100) / 100) * 100;

  return {
    distanceKm,
    totalUsd,
    totalRiel,
  };
}

const labels = {
  en: {
    title: "Est. Tuk-Tuk Fare",
    badge: "Fair Price",
    needLocation: "Enable location for fare estimate",
    distance: "Distance",
  },
  kh: {
    title: "Est. Tuk-Tuk Fare",
    badge: "Fair Price",
    needLocation: "Enable location for fare estimate",
    distance: "Distance",
  },
};

export default function TukTukPrice({
  destinationLat,
  destinationLng,
  userLat,
  userLng,
  language,
}: TukTukPriceProps) {
  const text = labels[language];

  if (userLat === null || userLng === null) {
    return (
      <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-500">
        🛺 {text.needLocation}
      </div>
    );
  }

  const distanceKm = calculateDistanceKm(userLat, userLng, destinationLat, destinationLng);
  const fare = calculateFare(distanceKm);

  return (
    <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">🛺</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {text.title}
            </p>
            <p className="text-xs font-bold text-slate-800">
              ${fare.totalUsd.toFixed(2)} <span className="text-slate-400">/</span>{" "}
              {fare.totalRiel.toLocaleString()}៛
            </p>
          </div>
        </div>
        <span className="rounded bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">
          {text.badge}
        </span>
      </div>
      <p className="mt-1 text-[10px] text-slate-500">
        {text.distance}: {formatDistanceKm(fare.distanceKm)}
      </p>
    </div>
  );
}
