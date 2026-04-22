import { render, screen } from '@testing-library/react'
import {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent,
} from '@/components/ui/card' 

const TestCard = () => (
    <Card>
        <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
            <CardAction>
                <button>Action</button>
            </CardAction>
        </CardHeader>
        <CardContent>
            <p>This is the main content of the card.</p>
        </CardContent>
        <CardFooter>
            <p>Footer content</p>
        </CardFooter>
    </Card>
)

describe('Card Component', () => {
    it('should render all parts of the card with the correct content', () => {
        render(<TestCard />)

        expect(screen.getByText('Card Title')).toBeInTheDocument()
        expect(screen.getByText('Card Description')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument()

        expect(screen.getByText('This is the main content of the card.')).toBeInTheDocument()

        expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('should apply custom class names to card components', () => {
        render(
            <Card className="custom-card">
                <CardHeader className="custom-header" />
                <CardContent className="custom-content" />
                <CardFooter className="custom-footer" />
            </Card>
        )

        const cardElement = screen.getByText((content, element) => element.classList.contains('custom-card'))
        expect(cardElement).toBeInTheDocument()
        
        expect(cardElement.querySelector('.custom-header')).toBeInTheDocument()
        expect(cardElement.querySelector('.custom-content')).toBeInTheDocument()
        expect(cardElement.querySelector('.custom-footer')).toBeInTheDocument()
    })
})
