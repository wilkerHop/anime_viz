import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchResults } from './search-results';

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('SearchResults', () => {
  const mockPush = jest.fn();
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  it('should render no results state', () => {
    const emptyResults = {
      data: [],
      pagination: { total: 0, page: 1, limit: 24, totalPages: 0 },
    };
    render(<SearchResults results={emptyResults} />);
    expect(screen.getByText('No Results Found')).toBeInTheDocument();
  });

  it('should render anime cards', () => {
    const mockResults = {
      data: [
        { id: 1, title: 'Anime 1', genres: [] },
        { id: 2, title: 'Anime 2', genres: [] },
      ],
      pagination: { total: 2, page: 1, limit: 24, totalPages: 1 },
    };
    render(<SearchResults results={mockResults} />);
    
    expect(screen.getByText('Anime 1')).toBeInTheDocument();
    expect(screen.getByText('Anime 2')).toBeInTheDocument();
  });

  it('should render pagination', () => {
    const mockResults = {
      data: [{ id: 1, title: 'Anime 1', genres: [] }],
      pagination: { total: 50, page: 1, limit: 24, totalPages: 3 },
    };
    render(<SearchResults results={mockResults} />);
    
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('should handle pagination click', () => {
    const mockResults = {
      data: [{ id: 1, title: 'Anime 1', genres: [] }],
      pagination: { total: 50, page: 1, limit: 24, totalPages: 3 },
    };
    render(<SearchResults results={mockResults} />);
    
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('page=2'));
  });
});
