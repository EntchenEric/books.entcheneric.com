import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover'

const TestPopover = () => (
    <Popover>
        <PopoverTrigger>
            Open Popover
        </PopoverTrigger>
        <PopoverContent>
            <p>This is the popover content.</p>
        </PopoverContent>
    </Popover>
)

describe('Popover Component', () => {
    it('should open on trigger click and close on a subsequent click', async () => {
        const user = userEvent.setup()
        render(<TestPopover />)

        const triggerButton = screen.getByRole('button', { name: /open popover/i })

        expect(screen.queryByText(/this is the popover content/i)).not.toBeInTheDocument()

        await user.click(triggerButton)

        const popoverContent = await screen.findByText(/this is the popover content/i)
        expect(popoverContent).toBeInTheDocument()

        await user.click(triggerButton)

        await waitFor(() => {
            expect(screen.queryByText(/this is the popover content/i)).not.toBeInTheDocument()
        })
    })

    it('should close when a user clicks outside the popover content', async () => {
        const user = userEvent.setup()
        render(
            <div>
                <TestPopover />
                <div data-testid="outside-element">Outside</div>
            </div>
        )

        const triggerButton = screen.getByRole('button', { name: /open popover/i })

        await user.click(triggerButton)
        expect(await screen.findByText(/this is the popover content/i)).toBeInTheDocument()

        const outsideElement = screen.getByTestId('outside-element')
        await user.click(outsideElement)

        await waitFor(() => {
            expect(screen.queryByText(/this is the popover content/i)).not.toBeInTheDocument()
        })
    })

    it('should close when the Escape key is pressed', async () => {
        const user = userEvent.setup()
        render(<TestPopover />)

        const triggerButton = screen.getByRole('button', { name: /open popover/i })

        await user.click(triggerButton)
        expect(await screen.findByText(/this is the popover content/i)).toBeInTheDocument()

        await user.keyboard('{Escape}')

        await waitFor(() => {
            expect(screen.queryByText(/this is the popover content/i)).not.toBeInTheDocument()
        })
    })
})
