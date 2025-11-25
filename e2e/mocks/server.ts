import http from 'http';
import { URL } from 'url';

const PORT = 4000;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-MAL-CLIENT-ID');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '', `http://localhost:${PORT}`);
  console.log(`[MOCK SERVER] Request: ${req.method} ${url.pathname}`);

  if (req.method === 'GET') {
    if (url.pathname.match(/\/users\/.*\/animelist/)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        data: [
          {
            node: {
              id: 1,
              title: "Cowboy Bebop (Mock Server)",
              main_picture: { medium: "https://placehold.co/200x300", large: "https://placehold.co/400x600" },
              genres: [{ id: 1, name: "Action" }, { id: 24, name: "Sci-Fi" }]
            },
            list_status: { status: "completed", score: 10, updated_at: new Date().toISOString() }
          },
          {
            node: {
              id: 20,
              title: "Naruto (Mock Server)",
              main_picture: { medium: "https://placehold.co/200x300", large: "https://placehold.co/400x600" },
              genres: [{ id: 1, name: "Action" }, { id: 27, name: "Shounen" }]
            },
            list_status: { status: "completed", score: 8, updated_at: new Date().toISOString() }
          }
        ]
      }));
      return;
    }

    if (url.pathname.includes('/anime/ranking')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        data: [
          {
            node: {
              id: 9253,
              title: "Steins;Gate (Mock Server)",
              main_picture: { medium: "https://placehold.co/200x300", large: "https://placehold.co/400x600" },
              genres: [{ id: 24, name: "Sci-Fi" }, { id: 41, name: "Thriller" }]
            }
          },
          {
            node: {
              id: 16498,
              title: "Attack on Titan (Mock Server)",
              main_picture: { medium: "https://placehold.co/200x300", large: "https://placehold.co/400x600" },
              genres: [{ id: 1, name: "Action" }, { id: 10, name: "Fantasy" }]
            }
          }
        ]
      }));
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
  console.log(`Mock MAL API Server running on port ${PORT}`);
});
