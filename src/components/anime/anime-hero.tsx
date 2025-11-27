import { Badge } from "@/components/ui/badge";
import { Anime } from "@/lib/api/jikan-types";
import Image from "next/image";

interface AnimeHeroProps {
  anime: Anime;
}

export function AnimeHero({ anime }: AnimeHeroProps) {
  return (
    <div className="relative w-full bg-brutal-white border-4 border-brutal-black shadow-brutal p-6 md:p-8 mb-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Cover Image */}
        <div className="shrink-0 mx-auto md:mx-0">
          <div className="relative w-[225px] h-[318px] border-4 border-brutal-black shadow-brutal-lg rotate-1 hover:rotate-0 transition-transform duration-300">
            <Image
              src={anime.mainPicture || "/placeholder.jpg"}
              alt={anime.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col flex-grow gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tight text-brutal-black">
              {anime.title}
            </h1>
            {anime.titleEnglish && (
              <h2 className="text-xl md:text-2xl font-bold text-brutal-black/60 uppercase">
                {anime.titleEnglish}
              </h2>
            )}
          </div>

          <div className="flex flex-wrap gap-3 my-2">
            {anime.year && (
              <Badge variant="outline" className="text-sm">
                {anime.year}
              </Badge>
            )}
            {anime.season && (
              <Badge variant="outline" className="text-sm capitalize">
                {anime.season}
              </Badge>
            )}
            {anime.genres.map((genre) => (
              <Badge key={genre.id} variant="outline" className="text-sm">
                {genre.name}
              </Badge>
            ))}
            {anime.companies
              .filter((c) => c.type === 'Studio')
              .map((c) => (
                <Badge key={c.company.id} variant="outline" className="text-sm bg-brutal-yellow">
                  {c.company.name}
                </Badge>
              ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto">
            <div className="bg-brutal-pink p-3 border-3 border-brutal-black shadow-brutal-sm text-center">
              <div className="text-xs font-bold uppercase mb-1">Score</div>
              <div className="text-3xl font-black font-mono">{anime.stats.score || "N/A"}</div>
            </div>
            <div className="bg-brutal-cyan p-3 border-3 border-brutal-black shadow-brutal-sm text-center">
              <div className="text-xs font-bold uppercase mb-1">Rank</div>
              <div className="text-3xl font-black font-mono">#{anime.stats.ranked || "N/A"}</div>
            </div>
            <div className="bg-brutal-yellow p-3 border-3 border-brutal-black shadow-brutal-sm text-center">
              <div className="text-xs font-bold uppercase mb-1">Popularity</div>
              <div className="text-3xl font-black font-mono">#{anime.stats.popularity || "N/A"}</div>
            </div>
             <div className="bg-brutal-green p-3 border-3 border-brutal-black shadow-brutal-sm text-center">
              <div className="text-xs font-bold uppercase mb-1">Members</div>
              <div className="text-xl font-black font-mono flex items-center justify-center h-9">
                {anime.stats.members ? (anime.stats.members / 1000).toFixed(1) + 'k' : "N/A"}
              </div>
            </div>
          </div>
          
           <div className="mt-4 p-4 bg-brutal-bg border-3 border-brutal-black">
            <p className="text-sm md:text-base font-medium leading-relaxed line-clamp-4 hover:line-clamp-none transition-all">
              {anime.synopsis}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
