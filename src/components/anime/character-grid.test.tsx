import { render, screen } from '@testing-library/react';
import { CharacterGrid } from './character-grid';

describe('CharacterGrid', () => {
  const mockCharacters = [
    {
      character: { id: 1, name: 'Char 1', image: '/char1.jpg' },
      role: 'Main',
      voiceActors: [
        { person: { name: 'VA 1' }, language: 'Japanese' },
      ],
    },
    {
      character: { id: 2, name: 'Char 2', image: '/char2.jpg' },
      role: 'Supporting',
      voiceActors: [],
    },
  ];

  it('should render characters', () => {
    render(<CharacterGrid characters={mockCharacters as any} />);
    
    expect(screen.getByText('Characters')).toBeInTheDocument();
    expect(screen.getByText('Char 1')).toBeInTheDocument();
    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('Char 2')).toBeInTheDocument();
  });

  it('should render voice actors if available', () => {
    render(<CharacterGrid characters={mockCharacters as any} />);
    expect(screen.getByText('VA 1')).toBeInTheDocument();
  });
});
