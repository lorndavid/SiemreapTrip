import type { Metadata } from "next";
import SongLibrary from "@/components/SongLibrary";
import { getSongLibrary } from "@/lib/songs";

export const metadata: Metadata = {
  title: "Music Lounge | Angkor Go",
  description: "Play your uploaded MP3 songs while planning your Siem Reap trip.",
};

export default async function SongsPage() {
  const songs = await getSongLibrary();

  return <SongLibrary songs={songs} />;
}
