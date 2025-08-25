import * as React from 'react'
import { render, screen } from '@testing-library/react'
import BookDisplay from '@/app/ui/profile/book-display'

jest.mock('../../../app/ui/add-book-button', () => () => <div data-testid="add-book-button" />)
jest.mock('../../../app/ui/book-card', () => ({
    __esModule: true,
    default: ({ frontendBook }) => <div data-testid="book-card">{frontendBook.title}</div>,
    BookCardComponent: ({ book }) => <div data-testid="book-card-component">{book.title}</div>,
}))

jest.mock('lucide-react', () => ({
    BookIcon: () => <div data-testid="book-icon" />,
    BookOpenCheck: () => <div data-testid="book-open-check-icon" />,
}))

const mockUser = {
    id: '123',
    url: 'testuser',
}

const mockBooks = [
    {
        id: '1',
        title: 'The Hobbit',
        ISBNumber: '12345',
    },
    {
        id: '2',
        title: 'The Lord of the Rings Series',
        ISBNumber: 'SERIES',
    },
]

describe('BookDisplay Component', () => {
    it('should render books and the add button for the owner', () => {
        render(
            <BookDisplay
                filteredAndSortedBooks={mockBooks}
                isOwner={true}
                addBook={() => {}}
                dbUser={mockUser}
            />
        )

        expect(screen.getByText('2 Bücher gefunden')).toBeInTheDocument()
        expect(screen.getByTestId('add-book-button')).toBeInTheDocument()
        
        expect(screen.getByTestId('book-card')).toHaveTextContent('The Hobbit')
        expect(screen.getByTestId('book-card-component')).toHaveTextContent('The Lord of the Rings Series')
        
        expect(screen.queryByText('Keine Bücher gefunden')).not.toBeInTheDocument()
    })

    it('should show the owner-specific empty state when there are no books', () => {
        render(
            <BookDisplay
                filteredAndSortedBooks={[]}
                isOwner={true}
                addBook={() => {}}
                dbUser={mockUser}
            />
        )

        expect(screen.getByText('0 Bücher gefunden')).toBeInTheDocument()
        expect(screen.getByTestId('add-book-button')).toBeInTheDocument()
        expect(screen.getByText('Deine Bibliothek ist leer. Füge ein Buch hinzu, um deine Sammlung zu starten!')).toBeInTheDocument()
    })

    it('should show the visitor-specific empty state and hide the add button for visitors', () => {
        render(
            <BookDisplay
                filteredAndSortedBooks={[]}
                isOwner={false}
                addBook={() => {}}
                dbUser={mockUser}
            />
        )

        expect(screen.getByText('0 Bücher gefunden')).toBeInTheDocument()
        expect(screen.queryByTestId('add-book-button')).not.toBeInTheDocument()
        expect(screen.getByText('testuser hat noch keine Bücher, die den Filtern entsprechen.')).toBeInTheDocument()
    })

    it('should render a series as a link', () => {
        render(
            <BookDisplay
                filteredAndSortedBooks={mockBooks}
                isOwner={true}
                addBook={() => {}}
                dbUser={mockUser}
            />
        )

        const seriesLink = screen.getByRole('link', { name: /the lord of the rings series/i })
        expect(seriesLink).toBeInTheDocument()
        expect(seriesLink).toHaveAttribute('href', 'testuser/The Lord of the Rings Series')
    })
})
