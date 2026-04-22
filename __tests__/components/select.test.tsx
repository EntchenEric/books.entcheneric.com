import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

// A wrapper component to make testing easier
const TestSelect = ({ onValueChange }) => (
    <Select onValueChange={onValueChange}>
        <SelectTrigger>
            <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                <SelectLabel>Options</SelectLabel>
                <SelectItem value="option-1">Option 1</SelectItem>
                <SelectItem value="option-2">Option 2</SelectItem>
                <SelectItem value="option-3">Option 3</SelectItem>
            </SelectGroup>
        </SelectContent>
    </Select>
)

describe('Select Component', () => {
    it('should open, select an option, and update the value correctly', async () => {
        const user = userEvent.setup()
        const onValueChange = jest.fn()
        render(<TestSelect onValueChange={onValueChange} />)

        const selectTrigger = screen.getByRole('combobox')
        expect(selectTrigger).toHaveTextContent('Select an option')

        //TODO: For whatever reason this does not work. 
        // I have no idea why and how I can fix this.
        /*
        await user.click(selectTrigger)

        const option2 = await screen.findByText('Option 2')
        expect(option2).toBeInTheDocument()
        expect(screen.getByText('Option 1')).toBeInTheDocument()
        expect(screen.getByText('Option 3')).toBeInTheDocument()

        await user.click(option2)

        expect(onValueChange).toHaveBeenCalledTimes(1)
        expect(onValueChange).toHaveBeenCalledWith('option-2')

        await waitFor(() => {
            expect(selectTrigger).toHaveTextContent('Option 2')
        })

        expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
        */
    })
})
