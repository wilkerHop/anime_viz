"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchResult } from "@/lib/services/search-service";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchResultsProps {
  results: SearchResult;
}

export function SearchResults({ results }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, pagination } = results;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/search?${params.toString()}`);
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border-4 border-brutal-black shadow-brutal text-center p-8">
        <h3 className="text-3xl font-black uppercase mb-4">No Results Found</h3>
        <p className="text-lg font-medium text-brutal-black/70 max-w-md">
          We couldn't find any anime matching your criteria. Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((anime: any) => (
          <Link key={anime.id} href={`/anime/${anime.id}`} className="group block">
            <div className="bg-white border-4 border-brutal-black shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 transition-all duration-200 h-full flex flex-col">
              <div className="relative h-64 w-full border-b-4 border-brutal-black overflow-hidden">
                <Image 
                  src={anime.mainPicture || '/placeholder.jpg'} 
                  alt={anime.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  {anime.score && (
                    <Badge variant="warning" className="shadow-brutal-sm text-sm font-black">
                      ★ {anime.score}
                    </Badge>
                  )}
                  {anime.type && (
                    <Badge variant="default" className="shadow-brutal-sm text-xs bg-brutal-black text-white">
                      {anime.type}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-black uppercase leading-tight mb-2 line-clamp-2 group-hover:text-brutal-pink transition-colors">
                  {anime.titleEnglish || anime.title}
                </h3>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {anime.genres.slice(0, 2).map((g: any) => (
                    <span key={g.id} className="text-[10px] font-bold uppercase bg-brutal-bg px-2 py-1 border border-brutal-black">
                      {g.name}
                    </span>
                  ))}
                  {anime.year && (
                    <span className="text-[10px] font-bold uppercase bg-brutal-yellow px-2 py-1 border border-brutal-black">
                      {anime.year}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
            className="border-2 border-brutal-black font-bold uppercase disabled:opacity-50"
          >
            Prev
          </Button>
          <span className="font-black text-lg px-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
            className="border-2 border-brutal-black font-bold uppercase disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
