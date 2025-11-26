import { Badge } from "@/components/ui/badge";
import { AnimeCharacter } from "@/lib/api/jikan-types";
import Image from "next/image";

interface CharacterGridProps {
  characters: AnimeCharacter[];
}

export function CharacterGrid({ characters }: CharacterGridProps) {
  // Sort: Main characters first
  const sortedChars = [...characters].sort((a, b) => {
    if (a.role === "Main" && b.role !== "Main") return -1;
    if (a.role !== "Main" && b.role === "Main") return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-black uppercase border-l-8 border-brutal-pink pl-3">
        Characters
      </h3>
      
      <div className="flex overflow-x-auto pb-6 gap-4 snap-x">
        {sortedChars.map((char) => {
          const va = char.voiceActors.find((v) => v.language === "Japanese");
          
          return (
            <div 
              key={char.character.id}
              className="snap-start shrink-0 w-[160px] bg-white border-3 border-brutal-black shadow-brutal-sm hover:shadow-brutal transition-all"
            >
              <div className="relative h-[200px] w-full border-b-3 border-brutal-black">
                <Image
                  src={char.character.image || "/placeholder.jpg"}
                  alt={char.character.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={char.role === "Main" ? "default" : "secondary"}>
                    {char.role}
                  </Badge>
                </div>
              </div>
              
              <div className="p-3">
                <div className="font-bold text-sm leading-tight mb-1 line-clamp-2">
                  {char.character.name}
                </div>
                {va && (
                  <div className="text-xs text-brutal-black/60 flex items-center gap-1 mt-2 pt-2 border-t border-brutal-black/10">
                    <span className="truncate">{va.person.name}</span>
                    <span className="text-[10px] uppercase font-bold bg-brutal-bg px-1 border border-brutal-black">JP</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
