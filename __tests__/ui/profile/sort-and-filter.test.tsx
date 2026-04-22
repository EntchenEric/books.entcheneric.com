import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SortAndFilter from '@/app/ui/profile/sort-and-filter'

jest.mock('@/components/ui/select', () => ({
    Select: ({ children, value }: { children: React.ReactNode; value: string }) => <div data-testid={`select-${value}`}>{children}</div>,
    SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => <div data-testid={`item-${value}`}>{children}</div>,
    SelectTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    SelectValue: () => <span>Value</span>,
}))

jest.mock('@/components/ui/themeSwitch', () => ({
    __esModule: true,
    ThemeSwitcher: () => <div data-testid="theme-switcher" />,
}))

describe('SortAndFilter', () => {
    const defaultProps = {
        filter: '',
        setFilter: jest.fn(),
        sort: 'title-asc',
        setSort: jest.fn(),
        wishlistStatus: 'all',
        setWishlistStatus: jest.fn(),
        finishedStatus: 'all',
        setFinishedStatus: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render filter input', () => {
        render(<SortAndFilter {...defaultProps} />)
        expect(screen.getByPlaceholderText(/nach titel oder autor filtern/i)).toBeInTheDocument()
    })

    it('should render title', () => {
        render(<SortAndFilter {...defaultProps} />)
        expect(screen.getByText(/filtern & sortieren/i)).toBeInTheDocument()
    })

    it('should call setFilter on input change', async () => {
        const user = userEvent.setup()
        const setFilter = jest.fn()
        render(<SortAndFilter {...defaultProps} setFilter={setFilter} />)

        const input = screen.getByPlaceholderText(/nach titel oder autor filtern/i)
        await user.type(input, 'test')

        expect(setFilter).toHaveBeenCalled()
    })
})
