import { AnimeHero } from "@/components/anime/anime-hero";
import { CharacterGrid } from "@/components/anime/character-grid";
import { StaffList } from "@/components/anime/staff-list";
import { StatsPanel } from "@/components/anime/stats-panel";
import { ThemePlayer } from "@/components/anime/theme-player";
import { Button } from "@/components/ui/button";
import { getAnimeFromDatabase } from "@/lib/services/jikan-service";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnimeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const animeId = parseInt(id);

  if (isNaN(animeId)) {
    notFound();
  }

  // Fetch full anime details
  const dbAnime = await getAnimeFromDatabase(animeId);

  if (!dbAnime) {
    notFound();
  }

  // Map DB response to Domain Model
  const anime: any = {
    ...dbAnime,
    titleEnglish: dbAnime.titleEnglish,
    titleJapanese: dbAnime.titleJapanese,
    airedString: dbAnime.airedString,
    mainPicture: dbAnime.mainPicture,
    stats: {
      score: dbAnime.score,
      scoredBy: dbAnime.scoredBy,
      ranked: dbAnime.ranked,
      popularity: dbAnime.popularity,
      members: dbAnime.members,
      favorites: dbAnime.favorites,
    },
    // Map relations
    genres: dbAnime.genres,
    themes: dbAnime.themes,
    characters: dbAnime.characters.map((c: any) => ({
      character: {
        id: c.character.id,
        name: c.character.name,
        image: c.character.image,
      },
      role: c.role,
      voiceActors: c.voiceActors.map((va: any) => ({
        person: va.person,
        language: va.language,
      })),
    })),
    staff: dbAnime.staff.map((s: any) => ({
      person: s.person,
      role: s.role,
    })),
  };

  return (
    <main className="min-h-screen bg-brutal-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button variant="outline" asChild>
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>

        {/* Hero Section */}
        <AnimeHero anime={anime} />

        {/* Stats Panel */}
        <StatsPanel anime={anime} />

        {/* Characters & Staff */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CharacterGrid characters={anime.characters} />
            <ThemePlayer themes={anime.themes} />
          </div>
          
          <div className="space-y-8">
            <StaffList staff={anime.staff} />
          </div>
        </div>
      </div>
    </main>
  );
}
