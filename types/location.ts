export type LocationType =
  | "Temple"
  | "Nature"
  | "Dining"
  | "Shopping"
  | "Museum"
  | "Culture";

export type LocationMood =
  | "Epic"
  | "Adventurous"
  | "Peaceful"
  | "Local Life"
  | "Cultural Night";

export type GuideLocation = {
  id: number;
  name: string;
  nameKh: string;
  lat: number;
  lng: number;
  type: LocationType;
  desc: string;
  descKh: string;
  duration: string;
  bestTime: string;
  budget: string;
  highlight: string;
  highlightKh: string;
  mood?: LocationMood;
  moodKh?: string;
  icon?: string;
  rating?: number;
  photoTip?: string;
  photoTipKh?: string;
};
