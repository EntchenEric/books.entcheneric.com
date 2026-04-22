import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddBookButton from '@/app/ui/add-book-button' 


jest.mock('../../app/ui/book-search', () => ({ setSelectedBook }) => (
    <div data-testid="book-search">
        <button onClick={() => setSelectedBook({ id: '1', volumeInfo: { title: 'Mock Book' } })}>
            Select a Book
        </button>
    </div>
))

jest.mock('../../app/ui/add-book-form', () => ({ book, addBook, setKeepOpen }) => (
    <div data-testid="add-book-form">
        <p>{book.volumeInfo.title}</p>
        <button onClick={() => addBook({ id: 'db-1', title: 'Mock Book' })}>
            Add Book
        </button>
        <input type="checkbox" data-testid="keep-open-checkbox" onChange={(e) => setKeepOpen(e.target.checked)} />
    </div>
))

describe('AddBookButton Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should open the dialog and switch between search and add-book views', async () => {
        const user = userEvent.setup()
        render(<AddBookButton addBook={() => {}} userId="123" />)

        await user.click(screen.getByRole('button', { name: /buch hinzufügen/i }))
        
        expect(await screen.findByTestId('book-search')).toBeInTheDocument()
        expect(screen.getByText('Neues Buch finden')).toBeInTheDocument()

        const selectBookButton = screen.getByRole('button', { name: /select a book/i })
        await user.click(selectBookButton)

        expect(await screen.findByTestId('add-book-form')).toBeInTheDocument()
        expect(screen.getByText('Buchdetails hinzufügen')).toBeInTheDocument()

        const backButton = screen.getByRole('button', { name: /zurück/i })
        await user.click(backButton)
        expect(await screen.findByTestId('book-search')).toBeInTheDocument()
    })

    it('should call the addBook prop and close the dialog when a book is added', async () => {
        const user = userEvent.setup()
        const addBookMock = jest.fn()
        render(<AddBookButton addBook={addBookMock} userId="123" />)

        await user.click(screen.getByRole('button', { name: /buch hinzufügen/i }))
        await user.click(await screen.findByRole('button', { name: /select a book/i }))
        
        const addBookFormButton = await screen.findByRole('button', { name: /add book/i })
        await user.click(addBookFormButton)

        expect(addBookMock).toHaveBeenCalledTimes(1)
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    it('should keep the dialog open if the "keep open" checkbox is checked', async () => {
        const user = userEvent.setup()
        const addBookMock = jest.fn()
        render(<AddBookButton addBook={addBookMock} userId="123" />)

        await user.click(screen.getByRole('button', { name: /buch hinzufügen/i }))
        await user.click(await screen.findByRole('button', { name: /select a book/i }))

        const keepOpenCheckbox = await screen.findByTestId('keep-open-checkbox')
        await user.click(keepOpenCheckbox)
        await user.click(screen.getByRole('button', { name: /add book/i }))

        expect(addBookMock).toHaveBeenCalledTimes(1)
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByTestId('book-search')).toBeInTheDocument()
    })
})
