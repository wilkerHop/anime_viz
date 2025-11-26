"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    // Reset page on new search
    params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full">
      <div className="relative flex-grow">
        <Input
          type="text"
          placeholder="SEARCH ANIME..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-14 text-lg font-bold uppercase border-4 border-brutal-black shadow-brutal focus:shadow-brutal-lg transition-all"
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-brutal-black/50" />
      </div>
      <Button 
        type="submit" 
        size="lg" 
        className="h-14 px-8 text-xl font-black border-4 border-brutal-black shadow-brutal hover:shadow-brutal-lg active:translate-y-1 active:shadow-none transition-all bg-brutal-pink text-brutal-black hover:bg-brutal-pink/90"
      >
        GO
      </Button>
    </form>
  );
}
