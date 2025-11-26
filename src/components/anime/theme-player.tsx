import { Badge } from "@/components/ui/badge";
import { AnimeTheme } from "@/lib/api/jikan-types";

interface ThemePlayerProps {
  themes: AnimeTheme[];
}

export function ThemePlayer({ themes }: ThemePlayerProps) {
  const openings = themes.filter(t => t.type === 'Opening');
  const endings = themes.filter(t => t.type === 'Ending');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Openings */}
        <div className="space-y-4">
          <h3 className="text-xl font-black uppercase border-l-8 border-brutal-green pl-3">
            Openings
          </h3>
          <div className="space-y-2">
            {openings.length > 0 ? openings.map((theme, i) => (
              <div 
                key={i}
                className="bg-white border-2 border-brutal-black p-3 shadow-brutal-sm flex items-start gap-3"
              >
                <Badge variant="success" className="shrink-0 mt-0.5">OP {i + 1}</Badge>
                <div className="text-sm font-medium leading-tight">
                  {theme.text}
                </div>
              </div>
            )) : (
              <div className="text-brutal-black/50 italic text-sm">No opening themes found</div>
            )}
          </div>
        </div>

        {/* Endings */}
        <div className="space-y-4">
          <h3 className="text-xl font-black uppercase border-l-8 border-brutal-orange pl-3">
            Endings
          </h3>
          <div className="space-y-2">
            {endings.length > 0 ? endings.map((theme, i) => (
              <div 
                key={i}
                className="bg-white border-2 border-brutal-black p-3 shadow-brutal-sm flex items-start gap-3"
              >
                <Badge variant="orange" className="shrink-0 mt-0.5">ED {i + 1}</Badge>
                <div className="text-sm font-medium leading-tight">
                  {theme.text}
                </div>
              </div>
            )) : (
              <div className="text-brutal-black/50 italic text-sm">No ending themes found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
