export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q")?.trim();
    const category = searchParams.get("category") || "Songs";

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required." },
        { status: 400 },
      );
    }

    const apiKey = process.env.YOUTUBE_DATA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube API is not configured on the server." },
        { status: 500 },
      );
    }

    const type =
      category === "Artists"
        ? "channel"
        : category === "Playlists"
          ? "playlist"
          : "video";

    const params = new URLSearchParams({
      key: apiKey,
      part: "snippet",
      q: category === "Albums" ? `${query} album` : query,
      type,
      maxResults: "20",
      regionCode: "IN",
      relevanceLanguage: "hi",
      safeSearch: "moderate",
      order: "relevance",
    });

    if (type === "video") {
      params.set("videoCategoryId", "10");
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          error: `YouTube API request failed (${response.status}).`,
          details: errorText,
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    const results = (data.items ?? [])
      .map((item: any) => {
        const id =
          item.id?.videoId ||
          item.id?.channelId ||
          item.id?.playlistId;

        if (!id || !item.snippet?.title) {
          return null;
        }

        return {
          title: item.snippet.title,
          artist: item.snippet.channelTitle || "YouTube",
          cover:
            item.snippet.thumbnails?.high?.url ||
            item.snippet.thumbnails?.medium?.url ||
            "",
          youtubeVideoId: id,
          youtubeKind: type,
          duration: "YouTube",
        };
      })
      .filter(Boolean);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("YouTube search error:", error);

    return NextResponse.json(
      { error: "Unable to search YouTube right now." },
      { status: 500 },
    );
  }
}
