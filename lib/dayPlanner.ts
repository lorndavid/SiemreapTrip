import { GuideLocation } from "@/types/location";
import { calculateDistanceKm } from "@/lib/timeUtils";

export type PlannedStop = {
  location: GuideLocation;
  travelKm: number;
  travelMinutes: number;
  visitMinutes: number;
};

export type DayPlan = {
  stops: PlannedStop[];
  totalTravelKm: number;
  totalTravelMinutes: number;
  totalVisitMinutes: number;
};

const averageSpeedKmPerHour = 25;

function durationToMinutes(duration: string): number {
  const hoursMatch = duration.match(/(\d+(?:\.\d+)?)\s*hour/);
  const minsMatch = duration.match(/(\d+)\s*min/);
  const rangeMatch = duration.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);

  if (rangeMatch) {
    const left = Number(rangeMatch[1]);
    const right = Number(rangeMatch[2]);
    return Math.round(((left + right) / 2) * 60);
  }

  if (hoursMatch) {
    return Math.round(Number(hoursMatch[1]) * 60);
  }

  if (minsMatch) {
    return Number(minsMatch[1]);
  }

  return 75;
}

function bestTimeToMinutes(bestTime: string): number {
  const match = bestTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) {
    return 8 * 60;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === "PM" && hour < 12) {
    hour += 12;
  }
  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minute;
}

export function createSmartDayPlan(
  locations: GuideLocation[],
  currentMinutes: number,
  startLat: number,
  startLng: number,
  maxStops = 6,
): DayPlan {
  const pool = locations.slice(0, 20);
  const selected: PlannedStop[] = [];
  const usedIds = new Set<number>();

  let currentLat = startLat;
  let currentLng = startLng;
  let rollingMinutes = currentMinutes;

  while (selected.length < Math.min(maxStops, pool.length)) {
    let bestLocation: GuideLocation | null = null;
    let bestScore = Number.POSITIVE_INFINITY;
    let bestDistance = 0;

    for (const location of pool) {
      if (usedIds.has(location.id)) {
        continue;
      }

      const distanceKm = calculateDistanceKm(currentLat, currentLng, location.lat, location.lng);
      const travelMinutes = (distanceKm / averageSpeedKmPerHour) * 60;
      const idealMinutes = bestTimeToMinutes(location.bestTime);
      const schedulePenalty = Math.abs(rollingMinutes - idealMinutes) / 70;
      const score = distanceKm + schedulePenalty + travelMinutes / 45;

      if (score < bestScore) {
        bestScore = score;
        bestLocation = location;
        bestDistance = distanceKm;
      }
    }

    if (!bestLocation) {
      break;
    }

    const travelMinutes = Math.round((bestDistance / averageSpeedKmPerHour) * 60);
    const visitMinutes = durationToMinutes(bestLocation.duration);

    selected.push({
      location: bestLocation,
      travelKm: bestDistance,
      travelMinutes,
      visitMinutes,
    });

    usedIds.add(bestLocation.id);
    currentLat = bestLocation.lat;
    currentLng = bestLocation.lng;
    rollingMinutes += travelMinutes + visitMinutes;
  }

  const totalTravelKm = selected.reduce((sum, stop) => sum + stop.travelKm, 0);
  const totalTravelMinutes = selected.reduce((sum, stop) => sum + stop.travelMinutes, 0);
  const totalVisitMinutes = selected.reduce((sum, stop) => sum + stop.visitMinutes, 0);

  return {
    stops: selected,
    totalTravelKm,
    totalTravelMinutes,
    totalVisitMinutes,
  };
}
