import { FilterSidebar } from "@/components/search/filter-sidebar";
import { SearchInput } from "@/components/search/search-input";
import { SearchResults } from "@/components/search/search-results";
import { getAvailableGenres, getAvailableYears, searchAnime } from "@/lib/services/search-service";

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  // Parse search params
  const query = typeof params.q === 'string' ? params.q : undefined;
  const genres = typeof params.genres === 'string' ? params.genres.split(',') : undefined;
  const type = typeof params.type === 'string' ? params.type : undefined;
  const season = typeof params.season === 'string' ? params.season : undefined;
  const year = typeof params.year === 'string' ? parseInt(params.year) : undefined;
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;

  // Fetch data
  const [results, availableGenres, availableYears] = await Promise.all([
    searchAnime({
      query,
      genres,
      type,
      season,
      year,
      page,
      limit: 24,
    }),
    getAvailableGenres(),
    getAvailableYears(),
  ]);

  return (
    <main className="min-h-screen bg-brutal-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Search Bar */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-brutal-black">
            Search Database
          </h1>
          <SearchInput />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar genres={availableGenres} years={availableYears} />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex justify-between items-center">
              <p className="font-bold uppercase text-brutal-black/70">
                Found {results.pagination.total} results
              </p>
            </div>
            <SearchResults results={results} />
          </div>
        </div>
      </div>
    </main>
  );
}
