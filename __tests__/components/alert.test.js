import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Terminal } from 'lucide-react' 

describe('Alert Component', () => {
    it('should render a default alert with a title and description', () => {
        render(
            <Alert>
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                    You can add components to your app using the cli.
                </AlertDescription>
            </Alert>
        )

        // Check that the alert has the correct role for accessibility
        expect(screen.getByRole('alert')).toBeInTheDocument()

        // Check for the title and description
        expect(screen.getByText('Heads up!')).toBeInTheDocument()
        expect(screen.getByText(/You can add components/)).toBeInTheDocument()
    })

    it('should render the destructive variant correctly', () => {
        render(
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Your session has expired. Please log in again.
                </AlertDescription>
            </Alert>
        )

        const alert = screen.getByRole('alert')
        // Check for a class that is specific to the destructive variant
        expect(alert).toHaveClass('text-destructive')
    })

    it('should render an icon when provided', () => {
        render(
            <Alert>
                <Terminal className="h-4 w-4" data-testid="alert-icon" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                    You can add components to your app using the cli.
                </AlertDescription>
            </Alert>
        )

        // Check that the icon is rendered
        expect(screen.getByTestId('alert-icon')).toBeInTheDocument()
    })

    it('should apply custom class names', () => {
        const customClass = 'my-custom-alert'
        render(
            <Alert className={customClass}>
                <AlertTitle>Custom Alert</AlertTitle>
            </Alert>
        )

        const alert = screen.getByRole('alert')
        expect(alert).toHaveClass(customClass)
    })
})
