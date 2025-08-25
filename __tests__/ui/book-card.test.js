import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookCard from '@/app/ui/book-card'

global.fetch = jest.fn()

jest.mock('sonner', () => ({
    toast: jest.fn(),
}))

jest.mock('../../components/ui/dialog', () => ({
    Dialog: ({ children }) => <div data-testid="dialog">{children}</div>,
    DialogTrigger: ({ children }) => children,
    DialogContent: ({ children }) => <div data-testid="dialog-content">{children}</div>,
    DialogHeader: ({ children }) => <div>{children}</div>,
    DialogTitle: ({ children }) => <h2>{children}</h2>,
    DialogDescription: ({ children }) => <p>{children}</p>,
}))

jest.mock('../../app/ui/purchase-option-fetcher', () => () => <div data-testid="purchase-options" />)

const mockBook = {
    id: '1',
    googleBookId: 'google-1',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description: 'A fantasy novel.',
    thumbnail: 'http://example.com/hobbit.jpg',
    pages: 310,
    progress: 50,
    wishlisted: true,
    publicationYear: '1937',
}

describe('BookCard Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the card and handle wishlisting', async () => {
        const user = userEvent.setup()
        render(<BookCard frontendBook={mockBook} isOwner={true} />)

        const markAsPurchasedButton = screen.getByRole('button', { name: /als gekauft makieren/i })
        expect(markAsPurchasedButton).toBeInTheDocument()

        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ ...mockBook, wishlisted: false }),
        })

        await user.click(markAsPurchasedButton)

        expect(await screen.findByRole('button', { name: /auf die wunschliste/i })).toBeInTheDocument()
        expect(fetch).toHaveBeenCalledWith('/api/update_book', expect.any(Object))
    })

    it('should update page progress', async () => {
        const user = userEvent.setup()
        render(<BookCard frontendBook={mockBook} isOwner={true} />)

        const progressInput = screen.getByDisplayValue('50')
        const saveButton = screen.getByRole('button', { name: /speichern/i })

        expect(saveButton).toBeDisabled()

        await user.clear(progressInput)
        await user.type(progressInput, '100')
        expect(saveButton).not.toBeDisabled()

        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ ...mockBook, progress: 100 }),
        })

        await user.click(saveButton)

        await waitFor(() => {
            expect(progressInput).toHaveValue(100)
            expect(saveButton).toBeDisabled()
        })
        expect(fetch).toHaveBeenCalledWith('/api/update_book', expect.any(Object))
    })

    it('should handle deleting the book', async () => {
        const user = userEvent.setup()
        const { container } = render(<BookCard frontendBook={mockBook} isOwner={true} />)

        const deleteButtons = screen.getAllByRole('button', { name: /löschen/i })
        const deleteTriggerButton = deleteButtons[0]
        const confirmDeleteButton = deleteButtons[1]

        await user.click(deleteTriggerButton)

        const confirmDialog = screen.getByText('Willst du dieses Buch wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')
        expect(confirmDialog).toBeInTheDocument()

        fetch.mockResolvedValueOnce({ ok: true })

        await user.click(confirmDeleteButton)

        await waitFor(() => {
            expect(container.firstChild).toBeNull()
        })
        expect(fetch).toHaveBeenCalledWith('/api/delete_book', expect.any(Object))
    })
})
