import { GuideLocation } from "@/types/location";

export type TimelinePoint = {
  hour: number;
  crowd: number;
  heat: number;
};

function normalize(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

export function getCrowdHeatTimeline(location: GuideLocation): TimelinePoint[] {
  const baseCrowdByType = {
    Temple: 0.58,
    Nature: 0.42,
    Dining: 0.55,
    Shopping: 0.5,
    Museum: 0.47,
    Culture: 0.46,
  } as const;

  const baseCrowd = baseCrowdByType[location.type] ?? 0.5;
  const points: TimelinePoint[] = [];

  for (let hour = 6; hour <= 20; hour += 1) {
    const lunchBoost = hour >= 11 && hour <= 13 ? 0.12 : 0;
    const sunsetBoost = hour >= 16 && hour <= 18 ? 0.16 : 0;
    const eveningBoost = hour >= 18 && location.type !== "Temple" ? 0.18 : 0;
    const morningQuiet = hour <= 8 ? -0.12 : 0;

    const crowd = normalize(baseCrowd + lunchBoost + sunsetBoost + eveningBoost + morningQuiet);

    const heatPeak = Math.exp(-((hour - 13) ** 2) / 10);
    const heat = normalize(0.22 + heatPeak * 0.72);

    points.push({
      hour,
      crowd,
      heat,
    });
  }

  return points;
}
