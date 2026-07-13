import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { LoginPage, RegisterPage } from '../components/auth/AuthPages';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      update: vi.fn().mockReturnThis(),
    })),
  },
}));

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthProvider>
  );
}

function renderRegister() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('renders demo account buttons', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /Fan demo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Volunteer demo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Venue Staff demo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Organizer demo/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: 'notanemail' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it('has link to register page', () => {
    renderLogin();
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
  });

  it('has accessible form labels', () => {
    renderLogin();
    expect(screen.getByLabelText(/Email/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/Password/i)).toHaveAttribute('required');
  });
});

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    renderRegister();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
  });

  it('shows validation error for empty name', async () => {
    renderRegister();
    const submitButton = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
    });
  });

  it('has link to login page', () => {
    renderRegister();
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
  });

  it('has role selector with all roles', () => {
    renderRegister();
    const roleSelect = screen.getByLabelText(/Role/i);
    expect(roleSelect).toBeInTheDocument();
    const options = roleSelect.querySelectorAll('option');
    expect(options.length).toBe(4);
  });
});
