import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button' 

describe('Button Component', () => {
    it('should render a button and handle clicks', async () => {
        const user = userEvent.setup()
        const handleClick = jest.fn()
        render(<Button onClick={handleClick}>Click Me</Button>)

        const button = screen.getByRole('button', { name: /click me/i })
        expect(button).toBeInTheDocument()

        await user.click(button)
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when the disabled prop is true', async () => {
        const user = userEvent.setup()
        const handleClick = jest.fn()
        render(<Button onClick={handleClick} disabled>Disabled</Button>)

        const button = screen.getByRole('button', { name: /disabled/i })
        expect(button).toBeDisabled()

        await user.click(button)
        expect(handleClick).not.toHaveBeenCalled()
    })

    it.each([
        ['default', 'bg-primary'],
        ['destructive', 'bg-destructive'],
        ['outline', 'border'],
        ['secondary', 'bg-secondary'],
        ['ghost', 'hover:bg-accent'],
        ['link', 'text-primary'],
    ])('should render with the %s variant', (variant, expectedClass) => {
        render(<Button variant={variant}>Variant Test</Button>)
        const button = screen.getByRole('button', { name: /variant test/i })
        expect(button).toHaveClass(expectedClass)
    })

    it.each([
        ['default', 'h-9'],
        ['sm', 'h-8'],
        ['lg', 'h-10'],
        ['icon', 'size-9'],
    ])('should render with the %s size', (size, expectedClass) => {
        render(<Button size={size}>Size Test</Button>)
        const button = screen.getByRole('button', { name: /size test/i })
        expect(button).toHaveClass(expectedClass)
    })

    it('should render as a different component when asChild is true', () => {
        render(
            <Button asChild>
                <a href="/home">Home</a>
            </Button>
        )

        const link = screen.getByRole('link', { name: /home/i })
        expect(link).toBeInTheDocument()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()

        expect(link).toHaveClass('bg-primary')
    })
})
