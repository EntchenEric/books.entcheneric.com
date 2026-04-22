import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog' 

const TestDialog = () => (
    <Dialog>
        <DialogTrigger asChild>
            <button>Open Dialog</button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
                <DialogDescription>
                    This is the dialog description.
                </DialogDescription>
            </DialogHeader>
            <p>Some content here.</p>
            <DialogFooter>
                <DialogClose asChild>
                    <button>Confirm</button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
)

describe('Dialog Component', () => {
    it('should open and close with the trigger and footer button', async () => {
        const user = userEvent.setup()
        render(<TestDialog />)

        const trigger = screen.getByRole('button', { name: /open dialog/i })

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

        await user.click(trigger)
        const dialog = await screen.findByRole('dialog')
        expect(dialog).toBeInTheDocument()
        expect(screen.getByText('Dialog Title')).toBeInTheDocument()
        expect(screen.getByText('This is the dialog description.')).toBeInTheDocument()

        const confirmButton = screen.getByRole('button', { name: /confirm/i })
        await user.click(confirmButton)

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    it('should close when the Escape key is pressed', async () => {
        const user = userEvent.setup()
        render(<TestDialog />)

        const trigger = screen.getByRole('button', { name: /open dialog/i })
        await user.click(trigger)
        expect(await screen.findByRole('dialog')).toBeInTheDocument()

        await user.keyboard('{Escape}')

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    it('should close when clicking the default X close button', async () => {
        const user = userEvent.setup()
        render(<TestDialog />)

        const trigger = screen.getByRole('button', { name: /open dialog/i })
        await user.click(trigger)
        expect(await screen.findByRole('dialog')).toBeInTheDocument()

        const defaultCloseButton = screen.getByRole('button', { name: /close/i })
        await user.click(defaultCloseButton)

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })
})
