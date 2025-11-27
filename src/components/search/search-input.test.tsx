import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchInput } from './search-input';

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('SearchInput', () => {
  const mockPush = jest.fn();
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  it('should render input and button', () => {
    render(<SearchInput />);
    expect(screen.getByPlaceholderText('SEARCH ANIME...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go/i })).toBeInTheDocument();
  });

  it('should update input value', () => {
    render(<SearchInput />);
    const input = screen.getByPlaceholderText('SEARCH ANIME...');
    fireEvent.change(input, { target: { value: 'Naruto' } });
    expect(input).toHaveValue('Naruto');
  });

  it('should navigate on submit', () => {
    render(<SearchInput />);
    const input = screen.getByPlaceholderText('SEARCH ANIME...');
    fireEvent.change(input, { target: { value: 'Naruto' } });
    
    const form = screen.getByRole('button', { name: /go/i }).closest('form');
    fireEvent.submit(form!);

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/search?q=Naruto'));
  });

  it('should initialize with query param', () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('q=One Piece'));
    render(<SearchInput />);
    expect(screen.getByPlaceholderText('SEARCH ANIME...')).toHaveValue('One Piece');
  });
});
