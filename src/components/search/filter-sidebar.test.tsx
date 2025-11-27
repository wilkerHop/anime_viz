import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterSidebar } from './filter-sidebar';

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('FilterSidebar', () => {
  const mockPush = jest.fn();
  const mockSearchParams = new URLSearchParams();
  const mockGenres = [{ id: 1, name: 'Action' }, { id: 2, name: 'Comedy' }];
  const mockYears = [2023, 2022];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  it('should render filters', () => {
    render(<FilterSidebar genres={mockGenres} years={mockYears} />);
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Media Type')).toBeInTheDocument();
    expect(screen.getByText('Season')).toBeInTheDocument();
    expect(screen.getByText('Year')).toBeInTheDocument();
    expect(screen.getByText('Genres')).toBeInTheDocument();
  });

  it('should apply filters', () => {
    render(<FilterSidebar genres={mockGenres} years={mockYears} />);
    
    // Select a genre
    const actionCheckbox = screen.getByLabelText('Action');
    fireEvent.click(actionCheckbox);

    // Click apply
    fireEvent.click(screen.getByText('Apply Filters'));

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('genres=Action'));
  });

  it('should reset filters', () => {
    render(<FilterSidebar genres={mockGenres} years={mockYears} />);
    
    fireEvent.click(screen.getByText('Reset'));

    expect(mockPush).toHaveBeenCalledWith('/search');
  });
});
