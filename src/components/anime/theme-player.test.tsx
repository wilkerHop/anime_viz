import { AnimeTheme } from '@/lib/api/jikan-types';
import { render, screen } from '@testing-library/react';
import { ThemePlayer } from './theme-player';

describe('ThemePlayer', () => {
  const mockThemes: AnimeTheme[] = [
    { type: 'Opening', text: 'OP1: "Theme Song" by Artist' },
    { type: 'Ending', text: 'ED1: "Ending Song" by Artist' },
  ];

  it('should render themes', () => {
    render(<ThemePlayer themes={mockThemes} />);
    
    // expect(screen.getByText('Themes')).toBeInTheDocument();
    expect(screen.getByText('OP1: "Theme Song" by Artist')).toBeInTheDocument();
    expect(screen.getByText('ED1: "Ending Song" by Artist')).toBeInTheDocument();
  });

  it('should render badges', () => {
    render(<ThemePlayer themes={mockThemes} />);
    
    expect(screen.getByText('Openings')).toBeInTheDocument();
    expect(screen.getByText('Endings')).toBeInTheDocument();
  });

  it('should handle empty themes', () => {
    render(<ThemePlayer themes={[]} />);
    expect(screen.getByText('No opening themes found')).toBeInTheDocument();
  });
});
