# Anime Data Visualization

A Next.js 15 application to visualize anime data with comprehensive information from MyAnimeList via the Jikan API.

## Features

- **Rich Anime Data**: Characters, voice actors, staff, studios, themes, and more from Jikan API v4
- **Genre Connections Diagram**: Interactive Chord Diagram showing how often genres appear together
- **Dual Context**: Switch between Global aggregate data and Specific User data
- **Comprehensive Database**: Stores complete anime metadata, characters, staff, companies, and themes
- **No Authentication Required**: Uses free Jikan API (no API keys needed)
- **Automated Caching**: Data is cached in a database and can be updated on demand

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Prisma ORM (SQLite for Dev, compatible with Postgres/Supabase)
- **API**: Jikan API v4 (MyAnimeList data)
- **Visualization**: amCharts 5

## Setup

1.  **Clone the repository**
    ```bash
    git clone <repo-url>
    cd anime_viz
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Database**
    ```bash
    # Create .env file (no API key needed for Jikan!)
    echo 'DATABASE_URL="file:./dev.db"' > .env
    
    # Push schema to database
    npx prisma db push
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

- **Data Fetching**: 
  - `lib/api/jikan-client.ts` - Jikan API client with rate limiting
  - `lib/api/jikan-mapper.ts` - Data transformation layer
  - `lib/api/jikan-types.ts` - TypeScript type definitions
- **Service Layer**: `lib/services/jikan-service.ts` - Data synchronization
- **Database**: Comprehensive Prisma schema with 15+ models
- **Visualization**: `components/charts/GenreNetwork.tsx` uses amCharts
- **Automation**: GitHub Actions in `.github/workflows`

## Testing

The project includes comprehensive tests for the Jikan API integration:

```bash
# Test API integration (fetches live data)
npm run test:jikan

# Test database synchronization
npm run test:db-sync

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

## Anime Data Enrichment

You can automatically fetch missing anime data for all references in your database:

```bash
# Enrich all missing anime (related anime, etc.)
npm run enrich:anime

# Enrich all + their related anime (recursive)
npm run enrich:anime -- --all

# Enrich only first 5 missing anime
npm run enrich:anime -- --limit 5

# Enrich specific anime by MAL ID
npm run enrich:anime -- --anime 52991

# Enrich specific anime + its related anime
npm run enrich:anime -- --anime 52991 --related
```

This is useful when you have anime references from:
- Related anime (sequels, prequels, side stories)
- User anime lists
- Any other anime IDs in the database

## Exploring the Database

After fetching anime data, you can explore it visually:

```bash
npx prisma studio
```

This opens a web interface to browse all anime, characters, voice actors, staff, and more.

## Deployment

The application is designed to be deployed on Vercel or similar platforms. 
Ensure `DATABASE_URL` is set to your production database (e.g., Supabase).

## Jikan API Integration

The project uses the [Jikan API v4](https://jikan.moe/) to fetch comprehensive anime data:

### What Data Is Available?

- **Anime Metadata**: Titles, type, status, episodes, duration, rating, source
- **Statistics**: Score, ranking, popularity, members, favorites
- **Dates**: Aired dates, season, year
- **Content**: Synopsis, background, images
- **Genres**: Genres, themes, demographics
- **Companies**: Studios, producers, licensors
- **Characters**: Name, image, role (Main/Supporting)
- **Voice Actors**: Person info with language
- **Staff**: Directors, music, animation staff
- **Themes**: Opening and ending songs
- **Related Anime**: Sequels, prequels, side stories

### Rate Limiting

The Jikan API has a rate limit of 1 request per second. The integration handles this automatically:

- Requests are automatically spaced 1 second apart
- Failed requests are retried with exponential backoff
- Configurable via `JIKAN_RATE_LIMIT_MS` environment variable

### Example Usage

```typescript
import { fetchAndStoreAnimeDetails } from '@/lib/services/jikan-service';

// Fetch and store anime data
await fetchAndStoreAnimeDetails(52991); // Frieren: Beyond Journey's End
```

### Database Schema

The Prisma schema includes the following models:

- `Anime` - Main anime information
- `Genre` - Genre information
- `Company` - Studios, producers, licensors
- `Person` - Voice actors and staff
- `Character` - Character information
- `AnimeCompany` - Anime-company relation
- `AnimeCharacter` - Anime-character relation
- `VoiceActorAssignment` - Character-voice actor relation
- `AnimeStaff` - Anime-staff relation
- `AnimeTheme` - Opening/ending themes
- `RelatedAnime` - Related anime entries
- `GenreConnection` - Genre co-occurrence data
- `UserProfile` - User anime lists
- `GlobalStats` - Metadata
- `DataSnapshot` - Cache snapshots

## Integration Guide for AI Agents

If you want to implement this logic in an existing codebase using Prisma, you can use the following guide.

### 1. Prisma Schema

Add the following models to your `schema.prisma`:

```prisma
model UserProfile {
  id          Int      @id @default(autoincrement())
  username    String   @unique
  lastUpdated DateTime
  animes      Anime[]
}

model Anime {
  id          Int      @id
  title       String
  mainPicture String?
  genres      Genre[]
  users       UserProfile[]
}

model Genre {
  id     Int     @id
  name   String
  animes Anime[]
}

model GenreConnection {
  id        Int    @id @default(autoincrement())
  genreAId  Int
  genreBId  Int
  count     Int
  context   String // e.g., "GLOBAL" or "USER:username"
  
  @@unique([genreAId, genreBId, context])
}
```

### 2. Prompt for AI Agent

You can use the following prompt to instruct an AI coding agent to implement the backend logic for you:

> **Role**: Senior Backend Engineer
> **Task**: Implement a data synchronization and analysis service using Prisma and TypeScript.
> 
> **Context**:
> I have a Next.js application with the Prisma schema defined above. I need a system to fetch Anime data from an external API (e.g., MyAnimeList), cache it in the database, and analyze the connections between Genres.
> 
> **Requirements**:
> 1.  **Data Fetching**: Implement a function `fetchUserAnimeList(username)` that fetches data from an external API. For now, create a mock implementation that returns sample data.
> 2.  **Database Synchronization**: Implement a function `updateUserData(username)` that:
>     -   Fetches the latest data for the user.
>     -   Upserts the `UserProfile`, `Anime`, and `Genre` records in a transaction.
>     -   Ensures that the relationships (User-Anime, Anime-Genre) are correctly linked.
> 3.  **Analysis Logic**: Within the same update process, calculate the "Genre Connections":
>     -   For every Anime in the user's list, identify all pairs of Genres that appear together.
>     -   Count the frequency of each pair (e.g., "Action" + "Sci-Fi" appeared 5 times).
>     -   Store these counts in the `GenreConnection` table with the context `USER:{username}`.
> 4.  **Retrieval**: Implement `getGenreConnections(context)` to retrieve the top 50 strongest connections for visualization.
> 
> **Constraints**:
> -   Use strict TypeScript.
> -   Use `prisma.$transaction` for data integrity.
> -   Avoid `any` types.
> -   Handle errors gracefully.
