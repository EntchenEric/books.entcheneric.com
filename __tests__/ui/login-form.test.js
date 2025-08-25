import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '@/app/ui/login-form'
import { login } from '@/app/actions/auth'

jest.mock('../../app/actions/auth', () => ({
    login: jest.fn(),
}))

jest.mock('lucide-react', () => ({
    ...jest.requireActual('lucide-react'),
    Loader2: () => <div data-testid="loader" />,
    AlertCircle: () => <div data-testid="alert-icon" />,
}));

describe('LoginForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the form and submit data successfully', async () => {
        const user = userEvent.setup()
        login.mockResolvedValueOnce({ success: true })

        render(<LoginForm name="test" />)

        await user.type(screen.getByLabelText(/name/i), 'John Doe')
        await user.type(screen.getByLabelText(/passwort/i), 'password123')

        await user.click(screen.getByRole('button', { name: /anmelden/i }))

        await waitFor(() => {
            expect(login).toHaveBeenCalledTimes(1)
        })
    })

    it('should display server-side validation errors for name and password', async () => {
        const user = userEvent.setup()
        const errorResponse = {
            errors: {
                name: ['Invalid name.'],
                password: ['Invalid password.'],
            },
        }
        login.mockResolvedValueOnce(errorResponse)

        render(<LoginForm name="test" />)

        await user.type(screen.getByLabelText(/name/i), 'ValidUser')
        await user.type(screen.getByLabelText(/passwort/i), 'validpassword')
        await user.click(screen.getByRole('button', { name: /anmelden/i }))

        await waitFor(() => {
            expect(screen.getByText('Invalid name.')).toBeInTheDocument()
            expect(screen.getByText('Das Passwort ist ungültig')).toBeInTheDocument()
            expect(screen.getAllByText('Invalid password.')).toHaveLength(2)
        })
    })

    it('should show a loading spinner while submitting', async () => {
        const user = userEvent.setup()
        login.mockImplementation(() => new Promise(() => {}))

        render(<LoginForm name="test" />)

        await user.type(screen.getByLabelText(/name/i), 'John Doe')
        await user.type(screen.getByLabelText(/passwort/i), 'password123')
        await user.click(screen.getByRole('button', { name: /anmelden/i }))

        await waitFor(() => {
            expect(screen.getByTestId('loader')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /anmelden\.\.\./i })).toBeDisabled()
        })
    })
})
