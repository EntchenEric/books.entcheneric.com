import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeSwitcher } from '@/components/ui/themeSwitch'

const mockSetTheme = jest.fn()

jest.mock('next-themes', () => ({
    useTheme: () => ({
        setTheme: mockSetTheme,
    }),
}))

describe('ThemeSwitcher', () => {
    beforeEach(() => {
        mockSetTheme.mockClear()
    })

    it('should render the theme switcher button', () => {
        render(<ThemeSwitcher />)

        const triggerButton = screen.getByRole('button', { name: /select theme/i })
        expect(triggerButton).toBeInTheDocument()
    })

    it.each([
        { themeName: 'Light', expectedValue: 'light' },
        { themeName: 'Dark', expectedValue: 'dark' },
        { themeName: 'System', expectedValue: 'system' },
        { themeName: 'High Contrast', expectedValue: 'high-contrast' },
        { themeName: 'High Contrast Dark', expectedValue: 'high-contrast-dark' },
        { themeName: 'Crimson Red', expectedValue: 'crimson-red' },
        { themeName: 'Ocean Blue', expectedValue: 'ocean-blue' },
        { themeName: 'Hacker Green', expectedValue: 'hacker-green' },
        { themeName: 'Fluffy Pink', expectedValue: 'fluffy-pink' },
        { themeName: 'Baby Blue', expectedValue: 'baby-blue' },
    ])(
        'should call setTheme with "$expectedValue" when the "$themeName" option is clicked',
        async ({ themeName, expectedValue }) => {
            const user = userEvent.setup()
            render(<ThemeSwitcher />)

            const triggerButton = screen.getByRole('button', { name: /select theme/i })
            await user.click(triggerButton)

            const themeMenuItem = screen.getByRole('menuitem', { name: themeName })
            await user.click(themeMenuItem)

            expect(mockSetTheme).toHaveBeenCalledTimes(1)
            expect(mockSetTheme).toHaveBeenCalledWith(expectedValue)
        },
    )
})