import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GlobalError from '@/app/global-error'

describe('GlobalError', () => {
    it('should render critical error message and reload button', () => {
        const reset = jest.fn()
        render(<GlobalError error={new Error('Critical')} reset={reset} />)

        expect(screen.getByText(/kritischer fehler/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /seite neu laden/i })).toBeInTheDocument()
    })

    it('should call reset when button is clicked', async () => {
        const user = userEvent.setup()
        const reset = jest.fn()
        render(<GlobalError error={new Error('Critical')} reset={reset} />)

        const button = screen.getByRole('button', { name: /seite neu laden/i })
        await user.click(button)

        expect(reset).toHaveBeenCalledTimes(1)
    })
})
