import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import PurchaseOptionsFetcher from '@/app/ui/purchase-option-fetcher' 

global.fetch = jest.fn()

const mockBook = {
    id: 'db-book-id-12_3',
    googleBookId: 'google-book-id-456',
    title: 'Test Book',
    wishlisted: true,
}

describe('PurchaseOptionsFetcher Component', () => {
    beforeEach(() => {
        fetch.mockClear()
    })

    it('should show a loading state initially, then display fetched purchase options', async () => {
        fetch.mockImplementation((url) => {
            if (url.includes('googleapis.com')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        saleInfo: {
                            buyLink: 'http://google.com/buy',
                            retailPrice: { amount: 10.99 },
                        },
                    }),
                })
            }
            if (url.includes('/api/fetch_purchase_options')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([
                        { retailerName: 'Amazon', price: '12.50', url: 'http://amazon.com' },
                    ]),
                })
            }
            return Promise.reject(new Error('Unknown URL'))
        })

        render(<PurchaseOptionsFetcher book={mockBook} />)

        expect(screen.getByText('Suche Preise...')).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.queryByText('Suche Preise...')).not.toBeInTheDocument()
        })

        expect(screen.getByText('google play')).toBeInTheDocument()
        expect(screen.getByText((content) => content.startsWith('10,99'))).toBeInTheDocument()
        expect(screen.getByText('Amazon')).toBeInTheDocument()
        expect(screen.getByText((content) => content.startsWith('12,50'))).toBeInTheDocument()
    })

    it('should display a message when no purchase options are found', async () => {
        fetch.mockImplementation((url) => {
            if (url.includes('googleapis.com')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ saleInfo: {} }),
                })
            }
            if (url.includes('/api/fetch_purchase_options')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                })
            }
            return Promise.reject(new Error('Unknown URL'))
        })

        render(<PurchaseOptionsFetcher book={mockBook} />)

        await waitFor(() => {
            expect(screen.getByText('Keine Kaufoptionen gefunden.')).toBeInTheDocument()
        })
    })

    it('should display an error message if fetching fails', async () => {
        fetch.mockRejectedValueOnce(new Error('API Error'))

        render(<PurchaseOptionsFetcher book={mockBook} />)

        await waitFor(() => {
            expect(screen.getByText('Kaufoptionen konnten nicht geladen werden.')).toBeInTheDocument()
        })
    })

    it('should render nothing if the book is not wishlisted', () => {
        const notWishlistedBook = { ...mockBook, wishlisted: false }
        const { container } = render(<PurchaseOptionsFetcher book={notWishlistedBook} />)

        expect(container.firstChild).toBeNull()
    })
})
