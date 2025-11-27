import { render, screen } from '@testing-library/react';
import { StatsPanel } from './stats-panel';

describe('StatsPanel', () => {
  const mockAnime = {
    episodes: 12,
    status: 'Finished Airing',
    airedString: 'Winter 2023',
    duration: '24 min',
    rating: 'PG-13',
    scoredBy: 1000,
    favorites: 100,
  };

  it('should render stats', () => {
    render(<StatsPanel anime={mockAnime as any} />);
    
    expect(screen.getByText('Episodes')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Finished Airing')).toBeInTheDocument();
    
    expect(screen.getByText('Aired')).toBeInTheDocument();
    expect(screen.getByText('Winter 2023')).toBeInTheDocument();
  });
});
