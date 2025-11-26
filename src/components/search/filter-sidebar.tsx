"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface FilterSidebarProps {
  genres: { id: number; name: string }[];
  years: number[];
}

export function FilterSidebar({ genres, years }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for filters
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.get("genres")?.split(",") || []
  );
  const [selectedType, setSelectedType] = useState<string>(
    searchParams.get("type") || ""
  );
  const [selectedSeason, setSelectedSeason] = useState<string>(
    searchParams.get("season") || ""
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    searchParams.get("year") || ""
  );

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedGenres.length > 0) {
      params.set("genres", selectedGenres.join(","));
    } else {
      params.delete("genres");
    }

    if (selectedType) params.set("type", selectedType);
    else params.delete("type");

    if (selectedSeason) params.set("season", selectedSeason);
    else params.delete("season");

    if (selectedYear) params.set("year", selectedYear);
    else params.delete("year");

    // Reset page
    params.set("page", "1");

    router.push(`/search?${params.toString()}`);
  };

  const resetFilters = () => {
    setSelectedGenres([]);
    setSelectedType("");
    setSelectedSeason("");
    setSelectedYear("");
    router.push("/search");
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  return (
    <div className="bg-white border-4 border-brutal-black shadow-brutal p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black uppercase">Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetFilters}
          className="text-xs font-bold uppercase hover:bg-brutal-bg"
        >
          Reset
        </Button>
      </div>

      <Separator className="bg-brutal-black h-1" />

      {/* Type Filter */}
      <div className="space-y-3">
        <h4 className="font-bold uppercase text-sm">Media Type</h4>
        <div className="space-y-2">
          {["TV", "Movie", "OVA", "Special", "ONA", "Music"].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox 
                id={`type-${type}`} 
                checked={selectedType === type}
                onCheckedChange={() => setSelectedType(selectedType === type ? "" : type)}
                className="border-2 border-brutal-black data-[state=checked]:bg-brutal-cyan data-[state=checked]:text-brutal-black"
              />
              <Label htmlFor={`type-${type}`} className="uppercase font-medium cursor-pointer">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-brutal-black/20" />

      {/* Season Filter */}
      <div className="space-y-3">
        <h4 className="font-bold uppercase text-sm">Season</h4>
        <div className="grid grid-cols-2 gap-2">
          {["Winter", "Spring", "Summer", "Fall"].map((season) => (
            <Button
              key={season}
              variant={selectedSeason === season ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSeason(selectedSeason === season ? "" : season)}
              className={`uppercase font-bold border-2 ${
                selectedSeason === season 
                  ? "bg-brutal-yellow text-brutal-black border-brutal-black hover:bg-brutal-yellow/80" 
                  : "border-brutal-black hover:bg-brutal-bg"
              }`}
            >
              {season}
            </Button>
          ))}
        </div>
      </div>

      <Separator className="bg-brutal-black/20" />

      {/* Year Filter */}
      <div className="space-y-3">
        <h4 className="font-bold uppercase text-sm">Year</h4>
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full p-2 border-2 border-brutal-black font-bold uppercase bg-white focus:outline-none focus:ring-2 focus:ring-brutal-black"
        >
          <option value="">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <Separator className="bg-brutal-black/20" />

      {/* Genre Filter */}
      <div className="space-y-3">
        <h4 className="font-bold uppercase text-sm">Genres</h4>
        <ScrollArea className="h-60 pr-4 border-2 border-brutal-black p-2 bg-brutal-bg/20">
          <div className="space-y-2">
            {genres.map((genre) => (
              <div key={genre.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`genre-${genre.id}`} 
                  checked={selectedGenres.includes(genre.name)}
                  onCheckedChange={() => toggleGenre(genre.name)}
                  className="border-2 border-brutal-black data-[state=checked]:bg-brutal-green data-[state=checked]:text-brutal-black"
                />
                <Label htmlFor={`genre-${genre.id}`} className="uppercase font-medium text-xs cursor-pointer">
                  {genre.name}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Button 
        onClick={applyFilters} 
        className="w-full font-black uppercase border-4 border-brutal-black shadow-brutal hover:shadow-brutal-lg active:translate-y-1 active:shadow-none transition-all bg-brutal-black text-white hover:bg-brutal-black/90"
      >
        Apply Filters
      </Button>
    </div>
  );
}
