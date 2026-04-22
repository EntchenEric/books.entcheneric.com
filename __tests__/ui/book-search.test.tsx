import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookSearch from '@/app/ui/book-search'

global.fetch = jest.fn()

jest.mock('../../components/ui/skeleton', () => ({
    Skeleton: () => <div data-testid="skeleton" />,
}))

const mockApiResponse = {
    items: [
        {
            id: '1',
            volumeInfo: {
                title: 'The Hobbit',
                authors: ['J.R.R. Tolkien'],
                publishedDate: '1937-09-21',
                imageLinks: { smallThumbnail: 'http://example.com/hobbit.jpg' },
                description: 'A fantasy novel.'
            },
        },
        {
            id: '2',
            volumeInfo: {
                title: 'The Lord of the Rings',
                authors: ['J.R.R. Tolkien'],
                publishedDate: '1954-07-29',
                imageLinks: { smallThumbnail: 'http://example.com/lotr.jpg' },
                description: 'An epic high-fantasy novel.'
            },
        },
    ],
}

describe('BookSearch Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should search for books and display the results after a delay', async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApiResponse),
        })

        render(<BookSearch selectedBook={null} setSelectedBook={() => {}} userId="123" />)

        const input = screen.getByPlaceholderText('Suche ein Buch...')
        await user.type(input, 'Tolkien')

        await act(async () => {
            jest.advanceTimersByTime(750)
        })

        expect(await screen.findByText('The Hobbit')).toBeInTheDocument()
        expect(screen.getByText('The Lord of the Rings')).toBeInTheDocument()
        expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    })

    it('should handle selecting a book from the results', async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
        const setSelectedBookMock = jest.fn()
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApiResponse),
        })

        render(<BookSearch selectedBook={null} setSelectedBook={setSelectedBookMock} userId="123" />)

        const input = screen.getByPlaceholderText('Suche ein Buch...')
        await user.type(input, 'Tolkien')
        await act(async () => {
            jest.advanceTimersByTime(750)
        })
        const hobbitResult = await screen.findByText('The Hobbit')

        await user.click(hobbitResult)

        expect(setSelectedBookMock).toHaveBeenCalledTimes(1)
        expect(setSelectedBookMock).toHaveBeenCalledWith(mockApiResponse.items[0])
        expect(input).toHaveValue('The Hobbit')
    })

    it('should display an empty list when no books are found', async () => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ items: [] }),
        })

        render(<BookSearch selectedBook={null} setSelectedBook={() => {}} userId="123" />)

        const input = screen.getByPlaceholderText('Suche ein Buch...')
        await user.type(input, 'nonexistentbook')
        
        await act(async () => {
            jest.advanceTimersByTime(750)
        })

        await waitFor(() => {
            expect(screen.queryByRole('option')).not.toBeInTheDocument()
        })
    })
})
