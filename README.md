# Anime Data Visualization

A Next.js 15 application to visualize anime genre connections using data from MyAnimeList.

## Features

- **Genre Connections Diagram**: Interactive Chord Diagram showing how often genres appear together.
- **Dual Context**: Switch between Global aggregate data and Specific User data.
- **Automated Caching**: Data is cached in a database (SQLite/Postgres) and updated automatically every 24 hours.
- **Manual Updates**: Users can trigger updates with a cooldown mechanism.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Prisma ORM (SQLite for Dev, compatible with Postgres/Supabase)
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
    # Create .env file
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

- **Data Fetching**: `lib/api/mal.ts` (Currently mocks MAL API)
- **Database Logic**: `lib/db/cache.ts` handles caching and updates.
- **Visualization**: `components/charts/GenreNetwork.tsx` uses amCharts.
- **Automation**: GitHub Actions in `.github/workflows`.

## Deployment

The application is designed to be deployed on Vercel or similar platforms. 
Ensure `DATABASE_URL` is set to your production database (e.g., Supabase).

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
