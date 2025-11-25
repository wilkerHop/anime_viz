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
