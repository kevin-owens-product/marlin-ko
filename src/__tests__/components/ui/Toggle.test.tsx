import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from '@/components/ui/Toggle';

describe('Toggle Component', () => {
  it('should render with role="switch"', () => {
    render(<Toggle checked={false} onChange={() => {}} />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('should have aria-checked=false when unchecked', () => {
    render(<Toggle checked={false} onChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('should have aria-checked=true when checked', () => {
    render(<Toggle checked={true} onChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('should call onChange with the opposite value when clicked', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Toggle checked={false} onChange={handleChange} />);

    await user.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should call onChange with false when checked toggle is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Toggle checked={true} onChange={handleChange} />);

    await user.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('should not call onChange when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Toggle checked={false} onChange={handleChange} disabled />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeDisabled();

    await user.click(toggle);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should toggle on Enter key press', () => {
    const handleChange = jest.fn();
    render(<Toggle checked={false} onChange={handleChange} />);

    fireEvent.keyDown(screen.getByRole('switch'), { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should toggle on Space key press', () => {
    const handleChange = jest.fn();
    render(<Toggle checked={false} onChange={handleChange} />);

    fireEvent.keyDown(screen.getByRole('switch'), { key: ' ' });
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should not toggle on other key presses', () => {
    const handleChange = jest.fn();
    render(<Toggle checked={false} onChange={handleChange} />);

    fireEvent.keyDown(screen.getByRole('switch'), { key: 'Tab' });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should render a label when provided', () => {
    render(<Toggle checked={false} onChange={() => {}} label="Dark mode" />);
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
  });

  it('should set aria-label from label prop', () => {
    render(<Toggle checked={false} onChange={() => {}} label="Dark mode" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Dark mode');
  });

  it('should apply size classes correctly', () => {
    const { rerender } = render(
      <Toggle checked={false} onChange={() => {}} size="sm" />
    );
    expect(screen.getByRole('switch').className).toContain('sm');

    rerender(<Toggle checked={false} onChange={() => {}} size="md" />);
    expect(screen.getByRole('switch').className).toContain('md');

    rerender(<Toggle checked={false} onChange={() => {}} size="lg" />);
    expect(screen.getByRole('switch').className).toContain('lg');
  });

  it('should apply checked class when checked', () => {
    render(<Toggle checked={true} onChange={() => {}} />);
    expect(screen.getByRole('switch').className).toContain('checked');
  });

  it('should not apply checked class when unchecked', () => {
    render(<Toggle checked={false} onChange={() => {}} />);
    expect(screen.getByRole('switch').className).not.toContain('checked');
  });

  it('should apply disabled class when disabled', () => {
    render(<Toggle checked={false} onChange={() => {}} disabled />);
    expect(screen.getByRole('switch').className).toContain('disabled');
  });

  it('should use the provided id', () => {
    render(<Toggle checked={false} onChange={() => {}} id="custom-toggle" />);
    expect(screen.getByRole('switch')).toHaveAttribute('id', 'custom-toggle');
  });

  it('should associate label with toggle via htmlFor', () => {
    render(<Toggle checked={false} onChange={() => {}} id="my-toggle" label="Test" />);
    const label = screen.getByText('Test');
    expect(label).toHaveAttribute('for', 'my-toggle');
  });

  it('should have a thumb element inside', () => {
    render(<Toggle checked={false} onChange={() => {}} />);
    const toggle = screen.getByRole('switch');
    const thumb = toggle.querySelector('[class*="thumb"]');
    expect(thumb).toBeInTheDocument();
  });

  it('should set aria-disabled when disabled', () => {
    render(<Toggle checked={false} onChange={() => {}} disabled />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-disabled', 'true');
  });
});
