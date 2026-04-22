import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorPage from '@/app/error'

jest.mock('lucide-react', () => ({
    AlertTriangle: () => <div data-testid="alert-triangle" />,
}))

describe('ErrorPage', () => {
    it('should render error message and reset button', () => {
        const reset = jest.fn()
        render(<ErrorPage error={new Error('Test error')} reset={reset} />)

        expect(screen.getByText(/etwas ist schief gelaufen/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /erneut versuchen/i })).toBeInTheDocument()
    })

    it('should call reset when button is clicked', async () => {
        const user = userEvent.setup()
        const reset = jest.fn()
        render(<ErrorPage error={new Error('Test error')} reset={reset} />)

        const button = screen.getByRole('button', { name: /erneut versuchen/i })
        await user.click(button)

        expect(reset).toHaveBeenCalledTimes(1)
    })
})
