import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupForm from '@/app/ui/signup-form'
import { signup } from '@/app/actions/auth'

jest.mock('../../app/actions/auth', () => ({
    signup: jest.fn(),
}))

jest.mock('lucide-react', () => ({
    ...jest.requireActual('lucide-react'),
    Loader2: () => <div data-testid="loader" />,
}));
describe('SignupForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the form and submit data successfully', async () => {
        const user = userEvent.setup()
        signup.mockResolvedValueOnce({ success: true })
        render(<SignupForm />)

        await user.type(screen.getByLabelText(/name/i), 'John Doe')
        await user.type(screen.getByLabelText(/passwort/i), 'password123')

        await user.click(screen.getByRole('button', { name: /registrieren/i }))

        await waitFor(() => {
            expect(signup).toHaveBeenCalledTimes(1)
        })
    })

    it('should display server-side validation errors', async () => {
        const user = userEvent.setup()
        const errorResponse = {
            errors: {
                name: ['Name is too short.'],
                password: ['Password must contain a number.'],
            },
        }
        signup.mockResolvedValueOnce(errorResponse)

        render(<SignupForm />)

        await user.type(screen.getByLabelText(/name/i), 'John')
        await user.type(screen.getByLabelText(/passwort/i), 'password')
        await user.click(screen.getByRole('button', { name: /registrieren/i }))

        await waitFor(() => {
            expect(screen.getByText('Name is too short.')).toBeInTheDocument()
            expect(screen.getByText('Password must contain a number.')).toBeInTheDocument()
        })
    })

    it('should show a loading spinner while submitting', async () => {
        const user = userEvent.setup()
        signup.mockImplementation(() => new Promise(() => {}))

        render(<SignupForm />)

        await user.type(screen.getByLabelText(/name/i), 'John Doe')
        await user.type(screen.getByLabelText(/passwort/i), 'password123')
        await user.click(screen.getByRole('button', { name: /registrieren/i }))

        await waitFor(() => {
            expect(screen.getByTestId('loader')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /registrieren\.\.\./i })).toBeDisabled()
        })
    })
})
