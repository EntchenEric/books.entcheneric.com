import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Label } from '@/components/ui/label'

describe('Label Component', () => {
    it('should render its children as its content', () => {
        const labelText = 'Email Address'
        render(<Label>{labelText}</Label>)

        expect(screen.getByText(labelText)).toBeInTheDocument()
    })

    it('should focus the associated input field when clicked', async () => {
        const user = userEvent.setup()
        const inputId = 'email-input'
        const labelText = 'Your Email'
        
        render(
            <>
                <Label htmlFor={inputId}>{labelText}</Label>
                <input type="email" id={inputId} data-testid="email-input" />
            </>
        )

        const labelElement = screen.getByText(labelText)
        const inputElement = screen.getByTestId('email-input')

        expect(inputElement).not.toHaveFocus()

        await user.click(labelElement)

        expect(inputElement).toHaveFocus()
    })

    it('should apply custom class names', () => {
        const customClass = 'my-custom-label-class'
        const labelText = 'Username'
        render(<Label className={customClass}>{labelText}</Label>)

        const labelElement = screen.getByText(labelText)
        expect(labelElement).toHaveClass(customClass)
    })
})
