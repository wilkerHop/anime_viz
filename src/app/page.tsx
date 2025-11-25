import GenreNetwork from '@/components/charts/GenreNetwork';
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
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Anime Data Visualization
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
              Explore anime genre connections from MyAnimeList
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <form action={async (formData) => {
              "use server";
              const username = formData.get('username');
              if (username) redirect(`/?user=${username}`);
              else redirect('/');
            }} className="flex gap-2">
               <Input 
                name="username" 
                placeholder="Enter username"
                defaultValue={user || ''}
                className="w-64 bg-white dark:bg-zinc-900"
              />
              <Button type="submit">Search</Button>
            </form>
            {user && (
              <Button variant="outline" asChild>
                <Link href="/">Reset to Global</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Genre Connections</CardTitle>
                  <CardDescription>
                    {user ? `Showing data for user: ${user}` : 'Showing global data'}
                  </CardDescription>
                </div>
                <UpdateControlsWrapper lastUpdated={lastUpdated} username={user} />
              </div>
            </CardHeader>
            <CardContent>
              {connections.length > 0 ? (
                <GenreNetwork data={connections} />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-zinc-400">
                  No data available. Try searching for a user or wait for global data to load.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
