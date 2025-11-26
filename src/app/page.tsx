import GenreNetwork from '@/components/charts/GenreNetwork';
import ScoreDistribution from '@/components/charts/ScoreDistribution';
import SeasonalTrends from '@/components/charts/SeasonalTrends';
import StudioNetwork from '@/components/charts/StudioNetwork';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import UpdateControlsWrapper from '@/components/UpdateControlsWrapper';
import { getGenreConnections, getLastUpdated } from '@/lib/db/cache';
import { getScoreDistribution } from '@/lib/db/score-data';
import { getSeasonalTrends } from '@/lib/db/seasonal-data';
import { getTopStudios } from '@/lib/db/studio-data';
import { getFeaturedAnime } from '@/lib/services/jikan-service';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function FeaturedAnimeSection() {
  const featured = await getFeaturedAnime(6);
  
  if (featured.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black uppercase tracking-tight text-brutal-black border-l-8 border-brutal-pink pl-4">
        Featured Anime
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.map((anime) => (
          <Link key={anime.id} href={`/anime/${anime.id}`} className="group block">
            <div className="bg-white border-4 border-brutal-black shadow-brutal hover:shadow-brutal-lg hover:-translate-y-1 transition-all duration-200 h-full flex flex-col">
              <div className="relative h-48 w-full border-b-4 border-brutal-black overflow-hidden">
                <Image 
                  src={anime.mainPicture || '/placeholder.jpg'} 
                  alt={anime.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="warning" className="shadow-brutal-sm">
                    #{anime.popularity}
                  </Badge>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-black uppercase leading-tight mb-2 line-clamp-2 group-hover:text-brutal-pink transition-colors">
                  {anime.title}
                </h3>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {anime.genres.slice(0, 3).map(g => (
                    <span key={g.id} className="text-xs font-bold uppercase bg-brutal-bg px-2 py-1 border border-brutal-black">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function Home({ 
  searchParams,
}: { 
  searchParams: Promise<{ user?: string }>;
}) {
  const { user } = await searchParams;
  const context = user ? `USER:${user}` : 'USER:global_mock';
  
  // Fetch data
  const connections = await getGenreConnections(context);
  const lastUpdated = await getLastUpdated(context);
  
  // Fetch visualization data
  const scoreData = await getScoreDistribution();
  const seasonalData = await getSeasonalTrends();
  const topStudios = await getTopStudios(10);
  
  // Transform studio data for pack chart
  const studioNetworkData = {
    name: "Studios",
    children: topStudios.map(studio => ({
      name: studio.name,
      value: studio.animeCount,
    }))
  };

  return (
    <main className="min-h-screen bg-brutal-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white border-4 border-brutal-black shadow-brutal p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight text-brutal-black">
                Anime Insights
              </h1>
              <p className="text-brutal-black/70 mt-2 font-semibold">
                Explore anime genre connections powered by Jikan API
              </p>
              {user && (
                <Badge variant="secondary" className="mt-3">
                  User: {user}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
              <form action={async (formData) => {
                "use server";
                const username = formData.get('username');
                if (username) redirect(`/?user=${username}`);
                else redirect('/');
              }} className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                 <Input 
                  name="username" 
                  placeholder="Enter MAL Username..."
                  defaultValue={user || ''}
                  className="w-full md:w-64"
                />
                <Button type="submit" size="lg">Search</Button>
              </form>
              {user && (
                <Button variant="outline" size="lg" asChild>
                  <Link href="/">Reset to Global</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Genre Connections</CardTitle>
                  <CardDescription>
                    {user ? `User: ${user}'s anime collection` : 'Global MyAnimeList aggregate data'}
                  </CardDescription>
                </div>
                <UpdateControlsWrapper lastUpdated={lastUpdated} username={user} />
              </div>
            </CardHeader>
            <CardContent>
              {connections.length > 0 ? (
                <GenreNetwork data={connections} />
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-brutal-black/50">
                  <p className="text-2xl font-bold uppercase">No Data Available</p>
                  <p className="text-base font-medium text-center max-w-md">
                    Try searching for a MAL username or wait for global data to load.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Featured Anime */}
        <FeaturedAnimeSection />

        {/* Data Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
              <CardDescription>
                Distribution of anime scores across all entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scoreData.length > 0 ? (
                <ScoreDistribution data={scoreData} />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-brutal-black/50">
                  <p className="font-bold uppercase">No score data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Studio Network */}
          <Card>
            <CardHeader>
              <CardTitle>Top Studios</CardTitle>
              <CardDescription>
                Most prolific anime studios by production count
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studioNetworkData.children.length > 0 ? (
                <StudioNetwork data={studioNetworkData} />
              ) : (
                <div className="h-[500px] flex items-center justify-center text-brutal-black/50">
                  <p className="font-bold uppercase">No studio data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Seasonal Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Release Trends</CardTitle>
            <CardDescription>
              Number of anime released per season over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {seasonalData.length > 0 ? (
              <SeasonalTrends data={seasonalData} />
            ) : (
              <div className="h-[400px] flex items-center justify-center text-brutal-black/50">
                <p className="font-bold uppercase">No seasonal data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="bg-brutal-black text-brutal-white border-4 border-brutal-black shadow-brutal-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-bold uppercase tracking-wide">
              Powered by Jikan API v4 & MyAnimeList
            </p>
            <div className="flex gap-3">
              <Badge variant="success">Live Data</Badge>
              <Badge variant="warning">Rate Limited</Badge>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
