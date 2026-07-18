import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

function ThemeTestComponent() {
  const { theme, highContrast, largeText, toggleTheme, toggleHighContrast, toggleLargeText } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="high-contrast">{String(highContrast)}</span>
      <span data-testid="large-text">{String(largeText)}</span>
      <button onClick={toggleTheme} data-testid="toggle-theme">Toggle Theme</button>
      <button onClick={toggleHighContrast} data-testid="toggle-contrast">Toggle Contrast</button>
      <button onClick={toggleLargeText} data-testid="toggle-text">Toggle Text</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark', 'high-contrast', 'large-text');
  });

  it('provides default theme values', () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toMatch(/light|dark/);
    expect(screen.getByTestId('high-contrast').textContent).toBe('false');
    expect(screen.getByTestId('large-text').textContent).toBe('false');
  });

  it('toggles theme on button click', () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    const initialTheme = screen.getByTestId('theme').textContent;
    fireEvent.click(screen.getByTestId('toggle-theme'));
    const newTheme = screen.getByTestId('theme').textContent;
    expect(newTheme).not.toBe(initialTheme);
  });

  it('toggles high contrast on button click', () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('high-contrast').textContent).toBe('false');
    fireEvent.click(screen.getByTestId('toggle-contrast'));
    expect(screen.getByTestId('high-contrast').textContent).toBe('true');
  });

  it('toggles large text on button click', () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('large-text').textContent).toBe('false');
    fireEvent.click(screen.getByTestId('toggle-text'));
    expect(screen.getByTestId('large-text').textContent).toBe('true');
  });

  it('persists theme to localStorage', () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('toggle-theme'));
    expect(localStorage.getItem('theme')).toBeTruthy();
  });

  it('persists high contrast to localStorage', () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('toggle-contrast'));
    expect(localStorage.getItem('highContrast')).toBe('true');
  });
});
