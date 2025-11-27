import { render, screen } from '@testing-library/react';
import { AnimeHero } from './anime-hero';

describe('AnimeHero', () => {
  const mockAnime = {
    title: 'Test Anime',
    titleEnglish: 'Test Anime English',
    mainPicture: '/cover.jpg',
    synopsis: 'Test synopsis',
    year: 2023,
    season: 'Winter',
    genres: [{ id: 1, name: 'Action' }],
    companies: [{ company: { id: 1, name: 'Studio A' }, type: 'Studio' }],
    studios: [{ id: 1, name: 'Studio A' }],
    stats: {
      score: 8.5,
      ranked: 10,
      popularity: 5,
      members: 5000,
    },
  };

  it('should render anime details', () => {
    render(<AnimeHero anime={mockAnime as any} />);
    
    expect(screen.getByText('Test Anime')).toBeInTheDocument();
    expect(screen.getByText('Test Anime English')).toBeInTheDocument();
    expect(screen.getByText('Test synopsis')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('2023'))).toBeInTheDocument();
    expect(screen.getByText('Winter')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Studio A')).toBeInTheDocument();
  });

  it('should render stats', () => {
    render(<AnimeHero anime={mockAnime as any} />);
    
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText('#10')).toBeInTheDocument();
    expect(screen.getByText('#5')).toBeInTheDocument();
  });
});
