import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CreatePrompt from '../components/CreatePrompt';

// Mock the hooks
vi.mock('../hooks/usePrompts.js', () => ({
  usePromptMutations: () => ({
    createPrompt: vi.fn().mockResolvedValue({ success: true })
  })
}));

vi.mock('../hooks/useCategories.js', () => ({
  useCategories: () => ({
    categories: [
      { id: '1', name: 'Test Category' }
    ]
  })
}));

describe('CreatePrompt Component', () => {
  it('should render form fields', () => {
    render(<CreatePrompt />);
    
    expect(screen.getByLabelText(/Prompt Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('should have submit button', () => {
    render(<CreatePrompt />);
    const submitButton = screen.getByRole('button', { name: /Create Prompt/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('should update form fields on input', () => {
    render(<CreatePrompt />);
    const titleInput = screen.getByLabelText(/Prompt Title/i);
    
    fireEvent.change(titleInput, { target: { value: 'Test Prompt' } });
    expect(titleInput.value).toBe('Test Prompt');
  });
});
