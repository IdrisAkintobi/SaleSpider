import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginForm } from './login-form'
import * as AuthContext from '@/contexts/auth-context'

// Mock the auth context
vi.mock('@/contexts/auth-context')

const mockUseAuth = vi.mocked(AuthContext.useAuth)

describe('LoginForm', () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: null,
      userIsCashier: false,
      userIsManager: false,
      isLoading: false,
      login: mockLogin,
      logout: vi.fn(),
    })
  })

  it('renders login form with correct elements', () => {
    render(<LoginForm />)

    expect(screen.getByText('Welcome Back!')).toBeInTheDocument()
    expect(
      screen.getByText('Log in to access your SaleSpider dashboard.')
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('has correct input placeholders', () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')

    expect(emailInput).toHaveAttribute('placeholder', 'user@example.com')
    expect(passwordInput).toHaveAttribute('placeholder', '••••••••')
  })

  it('allows user to type in inputs', async () => {
    render(<LoginForm />)
    const user = userEvent.setup()

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')

    await user.type(emailInput, 'testuser@example.com')
    await user.type(passwordInput, 'password123')

    expect(emailInput).toHaveValue('testuser@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('has submit button that can be clicked', async () => {
    render(<LoginForm />)
    const user = userEvent.setup()

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /log in/i })

    await user.type(emailInput, 'testuser@example.com')
    await user.type(passwordInput, 'password123')

    expect(emailInput).toHaveValue('testuser@example.com')
    expect(passwordInput).toHaveValue('password123')
    expect(submitButton).not.toBeDisabled()

    await user.click(submitButton)
  })

  it('shows loading state when isLoading is true', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userIsCashier: false,
      userIsManager: false,
      isLoading: true,
      login: mockLogin,
      logout: vi.fn(),
    })

    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /log in/i })
    expect(submitButton).toBeDisabled()

    const loadingSpinner = document.querySelector('.animate-spin')
    expect(loadingSpinner).toBeInTheDocument()
  })

  it('disables submit button when loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userIsCashier: false,
      userIsManager: false,
      isLoading: true,
      login: mockLogin,
      logout: vi.fn(),
    })

    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /log in/i })
    expect(submitButton).toBeDisabled()
  })

  it('has correct form structure', () => {
    render(<LoginForm />)

    const forms = document.getElementsByTagName('form')
    expect(forms).toHaveLength(1)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(emailInput).toHaveAttribute('id', 'email')
    expect(passwordInput).toHaveAttribute('id', 'password')
  })

  it('supports keyboard navigation', async () => {
    render(<LoginForm />)
    const user = userEvent.setup()

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')

    await user.type(emailInput, 'testuser@example.com')
    await user.tab() // Should move to password field
    await user.type(passwordInput, 'password123')

    expect(emailInput).toHaveValue('testuser@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('accepts valid email formats', async () => {
    render(<LoginForm />)
    const user = userEvent.setup()

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')

    // Test with valid email format
    await user.type(emailInput, 'user@example.com')
    await user.type(passwordInput, 'password123')

    expect(emailInput).toHaveValue('user@example.com')
    expect(passwordInput).toHaveValue('password123')

    await user.clear(emailInput)
    await user.clear(passwordInput)
    await user.type(emailInput, 'manager@company.org')
    await user.type(passwordInput, 'password123')

    expect(emailInput).toHaveValue('manager@company.org')
    expect(passwordInput).toHaveValue('password123')
  })

  it('maintains proper accessibility attributes', () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /log in/i })

    expect(emailInput).toHaveAttribute('id', 'email')
    expect(passwordInput).toHaveAttribute('id', 'password')
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('toggles password visibility', async () => {
    render(<LoginForm />)
    const user = userEvent.setup()

    const passwordInput = screen.getByLabelText('Password')
    const toggleButton = screen.getByRole('button', { name: 'Show password' })

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Click toggle to show password
    await act(async () => {
      await user.click(toggleButton)
    })
    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(
      screen.getByRole('button', { name: 'Hide password' })
    ).toBeInTheDocument()

    // Click toggle to hide password again
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Hide password' }))
    })
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(
      screen.getByRole('button', { name: 'Show password' })
    ).toBeInTheDocument()
  })
})
