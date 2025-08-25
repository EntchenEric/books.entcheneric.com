import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginButton from '@/app/ui/login-button'

jest.mock('../../app/actions/auth', () => ({
    login: jest.fn(),
}))

describe('LoginButton Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should open the login dialog when the button is clicked', async () => {
        const user = userEvent.setup()
        render(<LoginButton name="test" />)

        const triggerButton = screen.getByRole('button', { name: /anmelden/i })
        expect(triggerButton).toBeInTheDocument()
        await user.click(triggerButton)

        const dialog = await screen.findByRole('dialog')
        expect(dialog).toBeInTheDocument()

        expect(screen.getByRole('heading', { name: /anmelden/i, level: 2 })).toBeInTheDocument()
        expect(screen.getByText('Bitte melde dich an.')).toBeInTheDocument()

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/passwort/i)).toBeInTheDocument()
    })
})
