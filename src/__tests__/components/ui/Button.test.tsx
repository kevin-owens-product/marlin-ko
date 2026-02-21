import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('should render with children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should render with primary variant by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('primary');
  });

  it('should apply the correct variant class', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button').className).toContain('secondary');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button').className).toContain('ghost');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button').className).toContain('danger');
  });

  it('should apply the correct size class', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button').className).toContain('sm');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button').className).toContain('md');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button').className).toContain('lg');
  });

  it('should call onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.className).toContain('loading');
  });

  it('should render a spinner when loading', () => {
    render(<Button loading>Loading</Button>);
    const spinner = document.querySelector('[class*="spinner"]');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });

  it('should not call onClick when loading', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button loading onClick={handleClick}>Loading</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render with icon on the left by default', () => {
    const icon = <span data-testid="test-icon">*</span>;
    render(<Button icon={icon}>With Icon</Button>);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should render icon on the right when iconPosition is right', () => {
    const icon = <span data-testid="test-icon">*</span>;
    render(
      <Button icon={icon} iconPosition="right">
        With Icon
      </Button>
    );

    const button = screen.getByRole('button');
    const iconElement = screen.getByTestId('test-icon');
    const textContent = button.textContent;
    expect(textContent).toContain('With Icon');
    expect(iconElement).toBeInTheDocument();
  });

  it('should apply fullWidth class when fullWidth is true', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button').className).toContain('fullWidth');
  });

  it('should pass through additional HTML attributes', () => {
    render(
      <Button data-testid="custom-button" aria-label="Custom label" type="submit">
        Submit
      </Button>
    );

    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should merge custom className with default classes', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('custom-class');
    expect(button.className).toContain('button');
  });

  it('should set aria-disabled when disabled or loading', () => {
    const { rerender } = render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');

    rerender(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });
});
