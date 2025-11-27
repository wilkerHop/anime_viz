# AnimeViz 📊

> **A Neo-Brutalist Anime Analytics Platform**

AnimeViz is a modern, high-performance web application for exploring anime statistics, trends, and connections. Built with a bold neo-brutalist design system, it offers a unique and engaging way to visualize data from the MyAnimeList database.

![AnimeViz Screenshot](public/placeholder.jpg)

## 🚀 Features

- **Neo-Brutalist Design**: Distinctive aesthetic with high contrast, thick borders, and vibrant colors.
- **Interactive Visualizations**:
  - **Genre Network**: Chord diagram showing connections between anime genres.
  - **Studio Network**: Pack chart displaying top studios by production volume.
  - **Score Distribution**: Column chart analyzing anime score ranges.
  - **Seasonal Trends**: Interactive timeline of anime releases.
- **Advanced Search & Filter**:
  - Full-text search for English and Japanese titles.
  - Multi-faceted filtering (Genre, Year, Season, Type).
  - Sort by Popularity, Rank, Score, and more.
- **Detailed Anime Pages**: Comprehensive info including stats, characters, staff, and themes.
- **Responsive Layout**: Fully optimized for desktop and mobile devices.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [SQLite](https://www.sqlite.org/) (via [Prisma](https://www.prisma.io/))
- **Visualization**: [amCharts 5](https://www.amcharts.com/)
- **Data Source**: [Jikan API](https://jikan.moe/) (Unofficial MyAnimeList API)

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/anime-viz.git
    cd anime-viz
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up the database**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  **Open your browser**:
    Navigate to [http://localhost:3000](http://localhost:3000) to see the app in action.

## 🏗️ Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable UI components and charts.
  - `charts`: amCharts 5 visualizations.
  - `ui`: shadcn/ui primitives.
  - `anime`: Anime-specific components (cards, stats, etc.).
- `src/lib`: Utility functions and services.
  - `api`: Jikan API integration.
  - `db`: Database access and caching logic.
  - `services`: Business logic (Search, etc.).
- `prisma`: Database schema and migrations.

## 🎨 Design System

The project uses a custom "Brutal" theme defined in Tailwind config:
- **Colors**: `brutal-black`, `brutal-white`, `brutal-pink`, `brutal-cyan`, `brutal-green`, `brutal-yellow`.
- **Shadows**: Hard, offset shadows (`shadow-brutal`, `shadow-brutal-lg`).
- **Typography**: `Inter` (sans) and `JetBrains Mono` (mono).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🧪 Testing

This project enforces a comprehensive testing strategy to ensure reliability.

### Unit Tests
We use **Jest** and **React Testing Library** for unit testing.
- Run all tests: `npm test`
- Watch mode: `npm test -- --watch`

### Test Enforcement
We have a custom script to ensure every file with exported functions has a corresponding test file.
- Run check: `npm run check:tests`

This check is integrated into our CI/CD pipeline.

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
