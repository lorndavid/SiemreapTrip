import { NextResponse } from "next/server";
import { getSongLibrary } from "@/lib/songs";

export const runtime = "nodejs";

export async function GET() {
  const songs = await getSongLibrary();
  return NextResponse.json({
    count: songs.length,
    songs,
  });
}
