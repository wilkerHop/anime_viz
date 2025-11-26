import { Anime } from "@/lib/api/jikan-types";

interface StatsPanelProps {
  anime: Anime;
}

export function StatsPanel({ anime }: StatsPanelProps) {
  const stats = [
    { label: "Type", value: anime.type },
    { label: "Source", value: anime.source },
    { label: "Episodes", value: anime.episodes?.toString() || "?" },
    { label: "Status", value: anime.status },
    { label: "Aired", value: anime.airedString },
    { label: "Rating", value: anime.rating },
    { label: "Duration", value: anime.duration },
    { label: "Season", value: anime.season ? `${anime.season} ${anime.year}` : "Unknown" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className="bg-white border-3 border-brutal-black shadow-brutal-sm p-4 hover:shadow-brutal hover:-translate-y-1 transition-all duration-200"
        >
          <div className="text-xs font-bold uppercase text-brutal-black/60 mb-1">
            {stat.label}
          </div>
          <div className="font-bold text-sm md:text-base truncate" title={stat.value || ""}>
            {stat.value || "N/A"}
          </div>
        </div>
      ))}
    </div>
  );
}
