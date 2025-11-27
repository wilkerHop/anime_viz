# Contributing to Anime Viz

Thank you for your interest in contributing to Anime Viz! This document outlines the standards and practices for contributing to this project.

## Development Workflow

1.  **Fork and Clone**: Fork the repository and clone it locally.
2.  **Install Dependencies**: Run `npm install` to install dependencies.
3.  **Create Branch**: Create a new branch for your feature or fix.
4.  **Develop**: Make your changes.
5.  **Test**: Run `npm test` to ensure all tests pass.
6.  **Commit**: Commit your changes with descriptive messages.
7.  **Push and PR**: Push your branch and open a Pull Request.

## Testing Requirements

We enforce a strict testing policy to ensure code quality and stability.

-   **Unit Tests**: Every file that exports a function, class, or component must have a corresponding `.test.ts` or `.test.tsx` file in the same directory.
-   **Test Coverage**: Tests should cover happy paths, error cases, and edge cases.
-   **Running Tests**:
    -   Run all tests: `npm test`
    -   Check for missing tests: `npm run check:tests`

**Note**: The CI pipeline will fail if any tests fail or if any exported functions are missing corresponding test files.

## Code Style

-   We use **TypeScript** for type safety.
-   We use **Tailwind CSS** for styling.
-   We follow **Neo-Brutalist** design principles (bold borders, high contrast, vibrant colors).

## Project Structure

-   `src/app`: Next.js App Router pages and layouts.
-   `src/components`: Reusable UI components.
-   `src/lib`: Utility functions, API clients, and database logic.
-   `src/scripts`: Build and maintenance scripts.
