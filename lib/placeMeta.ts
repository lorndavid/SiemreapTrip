import { GuideLocation, LocationMood, LocationType } from "@/types/location";

export const moodLabels: Record<LocationMood, { en: string; kh: string; icon: string }> = {
  Epic: { en: "Epic", kh: "អស្ចារ្យ", icon: "🌅" },
  Adventurous: { en: "Adventurous", kh: "ផ្សងព្រេង", icon: "🌿" },
  Peaceful: { en: "Peaceful", kh: "ស្ងប់ស្ងាត់", icon: "🪷" },
  "Local Life": { en: "Local Life", kh: "ជីវិតក្នុងតំបន់", icon: "🛍️" },
  "Cultural Night": { en: "Cultural Night", kh: "វប្បធម៌ពេលរាត្រី", icon: "🎭" },
};

const fallbackMoodByType: Record<LocationType, LocationMood> = {
  Temple: "Epic",
  Nature: "Peaceful",
  Dining: "Local Life",
  Shopping: "Local Life",
  Museum: "Peaceful",
  Culture: "Cultural Night",
};

const moodByLocationId: Record<number, LocationMood> = {
  1: "Epic",
  2: "Epic",
  3: "Adventurous",
  4: "Local Life",
  5: "Peaceful",
  6: "Epic",
  7: "Local Life",
  8: "Peaceful",
  9: "Peaceful",
  10: "Peaceful",
  11: "Adventurous",
  12: "Epic",
  13: "Epic",
  14: "Adventurous",
  15: "Peaceful",
  16: "Cultural Night",
  17: "Local Life",
  18: "Local Life",
  19: "Adventurous",
  20: "Cultural Night",
};

const photoTips: Record<number, { en: string; kh: string }> = {
  1: {
    en: "Stand by the left reflection pond for the best tower symmetry.",
    kh: "ឈរជិតអាងទឹកខាងឆ្វេង ដើម្បីបានរូបឆ្លុះស្មើស្អាតជាងគេ។",
  },
  2: {
    en: "Use a slight low angle to frame the smiling stone faces.",
    kh: "ថតមុំទាបបន្តិច ដើម្បីទទួលបានមុខចម្លាក់ញញឹមពេញស៊ុម។",
  },
  3: {
    en: "Morning light through tree roots creates dramatic depth.",
    kh: "ពន្លឺព្រឹកតាមឫសឈើ ធ្វើឱ្យរូបភាពមានជម្រៅខ្លាំង។",
  },
  4: {
    en: "Capture neon signs right after blue hour for vivid street scenes.",
    kh: "ថតបន្ទាប់ពីខ្យល់ល្ងាច ដើម្បីបានពន្លឺអក្សរនេអុងច្បាស់ស្អាត។",
  },
  5: {
    en: "Shoot side carvings around 8 AM for soft details.",
    kh: "ថតចម្លាក់ចំហៀងម៉ោងប្រហែល 8 ព្រឹក ដើម្បីបានព័ត៌មានលម្អិតទន់ភ្លន់។",
  },
  6: {
    en: "Arrive early and frame silhouettes at the ridge for sunset drama.",
    kh: "មកមុនពេលថ្ងៃលិច ហើយថតស្រមោលនៅជ្រុងកំពូលភ្នំ។",
  },
  10: {
    en: "Use wide framing at the waterfront for colorful sky reflections.",
    kh: "ប្រើមុំទូលាយជិតមាត់ទឹក ដើម្បីថតពណ៌មេឃឆ្លុះស្អាត។",
  },
  16: {
    en: "Portrait mode works best with stage lights and performers.",
    kh: "របៀប Portrait ល្អបំផុតជាមួយភ្លើងឆាក និងអ្នកសម្តែង។",
  },
};

export function getLocationMood(location: GuideLocation): LocationMood {
  return location.mood ?? moodByLocationId[location.id] ?? fallbackMoodByType[location.type];
}

export function getMoodLabel(mood: LocationMood, language: "en" | "kh"): string {
  return moodLabels[mood][language];
}

export function getMoodIcon(mood: LocationMood): string {
  return moodLabels[mood].icon;
}

export function getPhotoTip(location: GuideLocation, language: "en" | "kh"): string {
  if (language === "kh" && location.photoTipKh) {
    return location.photoTipKh;
  }

  if (language === "en" && location.photoTip) {
    return location.photoTip;
  }

  const fallback = photoTips[location.id];
  if (fallback) {
    return fallback[language];
  }

  return language === "kh"
    ? "សាកល្បងមុំពន្លឺខាងមុខដើម្បីបានរូបភាពស្រស់ស្អាត។"
    : "Try front-facing light with a slight side angle for a cleaner shot.";
}

export const moodOrder: Array<LocationMood | "All"> = [
  "All",
  "Epic",
  "Adventurous",
  "Peaceful",
  "Local Life",
  "Cultural Night",
];
