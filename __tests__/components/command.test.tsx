import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    Command,
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from '@/components/ui/command' 

window.HTMLElement.prototype.scrollIntoView = jest.fn()

const TestCommandDialog = ({ onSelect }) => {
    const [open, setOpen] = React.useState(false)

    const handleSelect = (value) => {
        onSelect(value)
        setOpen(false)
    }

    return (
        <>
            <button onClick={() => setOpen(true)}>Open Command</button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem onSelect={() => handleSelect('calendar')}>Calendar</CommandItem>
                        <CommandItem onSelect={() => handleSelect('search')}>Search Emoji</CommandItem>
                        <CommandItem onSelect={() => handleSelect('calculator')}>Calculator</CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}

describe('Command Component', () => {
    it('should open, filter items, and select an item with a click', async () => {
        const user = userEvent.setup()
        const onSelectMock = jest.fn()
        render(<TestCommandDialog onSelect={onSelectMock} />)

        const trigger = screen.getByRole('button', { name: /open command/i })
        await user.click(trigger)

        const input = await screen.findByPlaceholderText(/type a command or search/i)
        expect(input).toBeInTheDocument()
        expect(screen.getByText('Calendar')).toBeInTheDocument()
        expect(screen.getByText('Search Emoji')).toBeInTheDocument()

        await user.type(input, 'calc')
        
        const calculatorItem = await screen.findByText('Calculator')
        await user.click(calculatorItem)

        expect(onSelectMock).toHaveBeenCalledWith('calculator')
        expect(onSelectMock).toHaveBeenCalledTimes(1)

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    it('should display the empty state when no items match', async () => {
        const user = userEvent.setup()
        render(<TestCommandDialog onSelect={() => {}} />)

        await user.click(screen.getByRole('button', { name: /open command/i }))
        const input = await screen.findByPlaceholderText(/type a command or search/i)
        await user.type(input, 'nonexistent')

        expect(screen.getByText('No results found.')).toBeInTheDocument()
    })

    it('should navigate with arrow keys and select with Enter', async () => {
        const user = userEvent.setup()
        const onSelectMock = jest.fn()
        render(<TestCommandDialog onSelect={onSelectMock} />)

        await user.click(screen.getByRole('button', { name: /open command/i }))
        await screen.findByPlaceholderText(/type a command or search/i)

        await user.keyboard('{ArrowDown}')
        await user.keyboard('{ArrowDown}')
        
        await user.keyboard('{Enter}')

        expect(onSelectMock).toHaveBeenCalledWith('calculator')
        expect(onSelectMock).toHaveBeenCalledTimes(1)
        
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })
})
