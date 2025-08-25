import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label' 

describe('Checkbox Component', () => {
    it('should toggle between checked and unchecked states when clicked', async () => {
        const user = userEvent.setup()
        const onCheckedChangeMock = jest.fn()
        
        const TestComponent = () => {
            const [isChecked, setIsChecked] = React.useState(false)
            return (
                <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                        setIsChecked(checked)
                        onCheckedChangeMock(checked)
                    }}
                    aria-label="Accept terms"
                />
            )
        }

        render(<TestComponent />)
        const checkbox = screen.getByRole('checkbox')

        expect(checkbox).not.toBeChecked()

        await user.click(checkbox)
        expect(checkbox).toBeChecked()
        expect(onCheckedChangeMock).toHaveBeenCalledWith(true)
        expect(onCheckedChangeMock).toHaveBeenCalledTimes(1)

        await user.click(checkbox)
        expect(checkbox).not.toBeChecked()
        expect(onCheckedChangeMock).toHaveBeenCalledWith(false)
        expect(onCheckedChangeMock).toHaveBeenCalledTimes(2)
    })

    it('should be checked when associated label is clicked', async () => {
        const user = userEvent.setup()
        render(
            <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Accept terms and conditions</Label>
            </div>
        )

        const checkbox = screen.getByRole('checkbox')
        const label = screen.getByText('Accept terms and conditions')

        expect(checkbox).not.toBeChecked()

        await user.click(label)

        expect(checkbox).toBeChecked()
    })

    it('should be disabled when the disabled prop is true', async () => {
        const user = userEvent.setup()
        render(<Checkbox disabled aria-label="Disabled checkbox" />)
        
        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeDisabled()

        await user.click(checkbox)

        expect(checkbox).not.toBeChecked()
    })
})
