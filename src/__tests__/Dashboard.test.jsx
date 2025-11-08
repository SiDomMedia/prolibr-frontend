import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../components/Dashboard';

// Mock the hooks
vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({
    user: {
      displayName: 'Test User',
      email: 'test@example.com'
    },
    signOut: vi.fn()
  })
}));

vi.mock('../hooks/usePrompts.js', () => ({
  useAnalytics: () => ({
    analytics: {
      totalPrompts: 10,
      totalExecutions: 50,
      totalCategories: 5,
      avgResponseQuality: 4.5
    },
    loading: false
  })
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should render dashboard header', () => {
    render(<Dashboard />);
    expect(screen.getByText(/ProLibr/i)).toBeInTheDocument();
  });

  it('should display user name', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Welcome, Test User/i)).toBeInTheDocument();
  });

  it('should render analytics cards', () => {
    render(<Dashboard />);
    // The component should show analytics data
    expect(screen.getByText(/Secure AI Command Center/i)).toBeInTheDocument();
  });

  it('should have sign out button', () => {
    render(<Dashboard />);
    const signOutButton = screen.getByRole('button', { name: /Sign Out/i });
    expect(signOutButton).toBeInTheDocument();
  });
});
