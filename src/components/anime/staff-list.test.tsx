import { render, screen } from '@testing-library/react';
import { StaffList } from './staff-list';

describe('StaffList', () => {
  const mockStaff = [
    {
      person: { id: 1, name: 'Director Name', image: '/director.jpg' },
      role: 'Director',
    },
    {
      person: { id: 2, name: 'Actor Name', image: '/actor.jpg' },
      role: 'Main Cast',
    },
  ];

  it('should render staff members', () => {
    render(<StaffList staff={mockStaff as any} />);
    
    expect(screen.getByText('Staff')).toBeInTheDocument();
    expect(screen.getByText('Director Name')).toBeInTheDocument();
    expect(screen.getByText('Director')).toBeInTheDocument();
    expect(screen.getByText('Actor Name')).toBeInTheDocument();
  });

  it('should handle empty staff', () => {
    render(<StaffList staff={[]} />);
    expect(screen.queryByText('Director')).not.toBeInTheDocument();
  });
});
