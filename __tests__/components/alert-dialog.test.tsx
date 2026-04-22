import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from '@/components/ui/alert-dialog'

const TestAlertDialog = ({ onActionClick }) => (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            <button>Show Dialog</button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onActionClick}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
)

describe('AlertDialog Component', () => {
    it('should open, display content, and close via the cancel button', async () => {
        const user = userEvent.setup()
        const onActionClickMock = jest.fn()
        render(<TestAlertDialog onActionClick={onActionClickMock} />)

        const trigger = screen.getByRole('button', { name: /show dialog/i })
        await user.click(trigger)

        const dialog = await screen.findByRole('alertdialog')
        expect(dialog).toBeInTheDocument()
        expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument()
        expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()

        const cancelButton = screen.getByRole('button', { name: /cancel/i })
        await user.click(cancelButton)

        expect(onActionClickMock).not.toHaveBeenCalled()
        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
    })

    it('should trigger the action and close when the action button is clicked', async () => {
        const user = userEvent.setup()
        const onActionClickMock = jest.fn()
        render(<TestAlertDialog onActionClick={onActionClickMock} />)

        await user.click(screen.getByRole('button', { name: /show dialog/i }))
        await screen.findByRole('alertdialog')

        const continueButton = screen.getByRole('button', { name: /continue/i })
        await user.click(continueButton)

        expect(onActionClickMock).toHaveBeenCalledTimes(1)
        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
    })

    it('should close when the Escape key is pressed', async () => {
        const user = userEvent.setup()
        render(<TestAlertDialog onActionClick={() => {}} />)

        await user.click(screen.getByRole('button', { name: /show dialog/i }))
        expect(await screen.findByRole('alertdialog')).toBeInTheDocument()

        await user.keyboard('{Escape}')

        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
    })
})
