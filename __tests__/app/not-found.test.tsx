import { render, screen } from '@testing-library/react'
import NotFound from '@/app/not-found'

jest.mock('lucide-react', () => ({
    BookX: () => <div data-testid="book-x" />,
    ArrowLeft: () => <div data-testid="arrow-left" />,
}))

describe('NotFound', () => {
    it('should render 404 message and back link', () => {
        render(<NotFound />)

        expect(screen.getByText(/seite nicht gefunden/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /zurück zur startseite/i })).toBeInTheDocument()
    })
})
