import GenreNetwork from '@/components/charts/GenreNetwork';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getGenreConnections, getLastUpdated } from '@/lib/db/cache';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: { user?: string } }) {
  const user = searchParams.user;
  const context = user ? `USER:${user}` : 'USER:global_mock'; // Default to global mock if no user
  
  // Fetch data
  const connections = await getGenreConnections(context);
  const lastUpdated = await getLastUpdated(user || 'global_mock');

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Anime Insights</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
              Visualizing genre connections and trends from MyAnimeList.
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
                placeholder="Enter MAL Username..." 
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
                    {user ? `Showing data for user: ${user}` : 'Showing Global Aggregate Data'}
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
                  No data available. Click &quot;Update Data&quot; to fetch.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

// Client wrapper for UpdateControls to handle the API call
import UpdateControlsWrapper from '@/components/UpdateControlsWrapper';
