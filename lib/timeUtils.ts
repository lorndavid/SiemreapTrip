export type DayPhase = "day" | "golden" | "night";

export type CambodiaTimeSnapshot = {
  hour: number;
  minute: number;
  totalMinutes: number;
  formattedTime: string;
  formattedDate: string;
  isGoldenHour: boolean;
  phase: DayPhase;
};

const CAMBODIA_TIMEZONE = "Asia/Phnom_Penh";

function getCambodiaParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CAMBODIA_TIMEZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(now);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    hour: Number(map.hour ?? "0"),
    minute: Number(map.minute ?? "0"),
  };
}

export function getCambodiaTimeSnapshot(language: "en" | "kh"): CambodiaTimeSnapshot {
  const now = new Date();
  const { hour, minute } = getCambodiaParts(now);
  const totalMinutes = hour * 60 + minute;

  const isGoldenHour = totalMinutes >= 17 * 60 && totalMinutes <= 18 * 60 + 30;
  const isNight = totalMinutes < 5 * 60 || totalMinutes > 18 * 60 + 30;
  const phase: DayPhase = isGoldenHour ? "golden" : isNight ? "night" : "day";

  return {
    hour,
    minute,
    totalMinutes,
    formattedTime: new Intl.DateTimeFormat(language === "kh" ? "km-KH" : "en-US", {
      timeZone: CAMBODIA_TIMEZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now),
    formattedDate: new Intl.DateTimeFormat(language === "kh" ? "km-KH" : "en-US", {
      timeZone: CAMBODIA_TIMEZONE,
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(now),
    isGoldenHour,
    phase,
  };
}

export function formatDistanceKm(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }

  return `${distanceKm.toFixed(2)}km`;
}

export function calculateDistanceKm(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number {
  const earthRadiusKm = 6371;
  const dLat = ((toLat - fromLat) * Math.PI) / 180;
  const dLng = ((toLng - fromLng) * Math.PI) / 180;

  const lat1 = (fromLat * Math.PI) / 180;
  const lat2 = (toLat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}
