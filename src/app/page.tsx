import GenreNetwork from '@/components/charts/GenreNetwork';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import UpdateControlsWrapper from '@/components/UpdateControlsWrapper';
import { getGenreConnections, getLastUpdated } from '@/lib/db/cache';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Home({ 
  searchParams,
}: { 
  searchParams: Promise<{ user?: string }>;
}) {
  const { user } = await searchParams;
  const context = user ? `USER:${user}` : 'USER:global_mock';
  
  // Fetch data
  const connections = await getGenreConnections(context);
  const lastUpdated = await getLastUpdated(user || 'global_mock');

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
