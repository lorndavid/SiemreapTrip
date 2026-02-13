import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { SongTrack } from "@/types/song";

function toSongTitle(filename: string): string {
  return filename
    .replace(/\.mp3$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getSongLibrary(): Promise<SongTrack[]> {
  const songsDir = path.join(process.cwd(), "public", "songs");

  try {
    const entries = await fs.readdir(songsDir, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile() && /\.mp3$/i.test(entry.name))
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((entry, index) => ({
        id: `${index + 1}-${entry.name}`,
        title: toSongTitle(entry.name),
        filename: entry.name,
        src: `/songs/${encodeURIComponent(entry.name)}`,
      }));
  } catch {
    return [];
  }
}
