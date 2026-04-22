import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LogoutButton from '@/app/ui/logout-button'
import { deleteSession } from '@/app/lib/session'
import { toast } from 'sonner'

jest.mock('../../app/lib/session', () => ({
    deleteSession: jest.fn(),
}))

jest.mock('sonner', () => ({
    toast: {
        promise: jest.fn(),
    },
}))

describe('LogoutButton Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should open the alert dialog when the logout button is clicked', async () => {
        const user = userEvent.setup()
        render(<LogoutButton />)

        const triggerButton = screen.getByRole('button', { name: /abmelden/i })
        await user.click(triggerButton)

        const dialog = await screen.findByRole('alertdialog')
        expect(dialog).toBeInTheDocument()
        expect(screen.getByText('Möchtest du dich wirklich abmelden?')).toBeInTheDocument()
    })

    it('should close the dialog when the cancel button is clicked', async () => {
        const user = userEvent.setup()
        render(<LogoutButton />)

        await user.click(screen.getByRole('button', { name: /abmelden/i }))
        expect(await screen.findByRole('alertdialog')).toBeInTheDocument()

        const cancelButton = screen.getByRole('button', { name: /abbrechen/i })
        await user.click(cancelButton)

        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
        expect(deleteSession).not.toHaveBeenCalled()
    })

    it('should call deleteSession and toast.promise on confirmation', async () => {
        const user = userEvent.setup()
        deleteSession.mockResolvedValueOnce(undefined)

        toast.promise.mockImplementation(async (promise) => {
            await promise()
        })

        render(<LogoutButton />)

        await user.click(screen.getByRole('button', { name: /abmelden/i }))
        const confirmButton = await screen.findByRole('button', { name: /ja, abmelden/i })
        await user.click(confirmButton)

        await waitFor(() => {
            expect(deleteSession).toHaveBeenCalledTimes(1)
            expect(toast.promise).toHaveBeenCalledTimes(1)
        })
    })
})
