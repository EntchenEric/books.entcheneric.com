import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddBookForm from '@/app/ui/add-book-form'
import { addbook as apiAddBook } from '@/app/actions/addBook'
import { toast } from 'sonner'

jest.mock('../../app/actions/addBook', () => ({
    addbook: jest.fn(),
}))

jest.mock('sonner', () => ({
    toast: {
        loading: jest.fn(),
        dismiss: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
    },
}))

jest.mock('../../components/ui/tooltip', () => ({
    Tooltip: ({ children }) => <div>{children}</div>,
    TooltipTrigger: ({ children }) => <div>{children}</div>,
    TooltipContent: ({ children }) => <div>{children}</div>,
}))

const mockBookItem = {
    id: '1',
    volumeInfo: {
        title: 'The Hobbit',
        pageCount: 310,
    },
}

const mockAddedBook = {
    id: 'db-1',
    title: 'The Hobbit',
    // ... other properties
}

describe('AddBookForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should submit the form successfully and call the addBook prop', async () => {
        const user = userEvent.setup()
        const addBookMock = jest.fn()
        const setKeepOpenMock = jest.fn()

        // Mock a successful API response
        apiAddBook.mockResolvedValueOnce({ success: true, books: [mockAddedBook] })

        render(<AddBookForm book={mockBookItem} addBook={addBookMock} setKeepOpen={setKeepOpenMock} />)

        // --- Fill and submit the form ---
        const progressInput = screen.getByLabelText(/lesefortschritt/i)
        await user.clear(progressInput)
        await user.type(progressInput, '50')
        await user.click(screen.getByRole('button', { name: /buch zur bibliothek hinzufügen/i }))

        // --- Assertions ---
        await waitFor(() => {
            expect(apiAddBook).toHaveBeenCalledTimes(1)
            expect(toast.success).toHaveBeenCalledWith('Buch erfolgreich hinzugefügt!')
            expect(addBookMock).toHaveBeenCalledWith(mockAddedBook)
        })
    })

    it('should handle server-side errors on submission', async () => {
        const user = userEvent.setup()
        const addBookMock = jest.fn()
        const setKeepOpenMock = jest.fn()

        // Mock an error response
        const errorResponse = { errors: { form: ['Something went wrong.'] } }
        apiAddBook.mockResolvedValueOnce(errorResponse)

        render(<AddBookForm book={mockBookItem} addBook={addBookMock} setKeepOpen={setKeepOpenMock} />)

        await user.click(screen.getByRole('button', { name: /buch zur bibliothek hinzufügen/i }))

        // --- Assertions ---
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Fehler beim Hinzufügen', { description: 'Something went wrong.' })
        })
    })

    it('should disable progress input when wishlist is checked', async () => {
        const user = userEvent.setup()
        render(<AddBookForm book={mockBookItem} addBook={() => {}} setKeepOpen={() => {}} />)

        const progressInput = screen.getByLabelText(/lesefortschritt/i)
        const wishlistCheckbox = screen.getByRole('checkbox', { name: /auf meine wunschliste setzen/i })

        expect(progressInput).not.toBeDisabled()

        // --- Check the wishlist box ---
        await user.click(wishlistCheckbox)
        expect(progressInput).toBeDisabled()
    })

    it('should show "mark all as finished" when "add series" is checked', async () => {
        const user = userEvent.setup()
        render(<AddBookForm book={mockBookItem} addBook={() => {}} setKeepOpen={() => {}} />)

        const addSeriesCheckbox = screen.getByRole('checkbox', { name: /gesamte buchserie hinzufügen/i })
        
        // --- Initially, the sub-checkbox is not visible ---
        expect(screen.queryByRole('checkbox', { name: /alle als gelesen markieren/i })).not.toBeInTheDocument()

        // --- Check the "add series" box ---
        await user.click(addSeriesCheckbox)
        expect(await screen.findByRole('checkbox', { name: /alle als gelesen markieren/i })).toBeInTheDocument()
    })
})
