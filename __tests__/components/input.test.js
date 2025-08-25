import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input' 

describe('Input Component', () => {
    it('should render and allow text to be entered', async () => {
        const user = userEvent.setup()
        render(<Input type="text" placeholder="Enter your name" />)

        const inputElement = screen.getByPlaceholderText('Enter your name')
        expect(inputElement).toBeInTheDocument()

        const testValue = 'John Doe'
        await user.type(inputElement, testValue)

        expect(inputElement).toHaveValue(testValue)
    })

    it('should be disabled when the disabled prop is true', () => {
        render(<Input type="text" disabled data-testid="disabled-input" />)

        const inputElement = screen.getByTestId('disabled-input')

        expect(inputElement).toBeDisabled()
    })

    it('should apply custom class names', () => {
        const customClass = 'my-custom-input-class'
        render(<Input type="text" className={customClass} data-testid="custom-class-input" />)

        const inputElement = screen.getByTestId('custom-class-input')
        
        expect(inputElement).toHaveClass(customClass)
    })

    it('should render with the correct type attribute', () => {
        render(<Input type="password" data-testid="password-input" />)

        const inputElement = screen.getByTestId('password-input')

        expect(inputElement).toHaveAttribute('type', 'password')
    })
})
