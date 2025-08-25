import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'

const TestDropdown = ({ onItemClick = () => {}, onSubItemClick = () => {} }) => {
    const [showStatusBar, setShowStatusBar] = React.useState(true)
    const [panel, setPanel] = React.useState('side')

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button>Open Menu</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={onItemClick}>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                    checked={showStatusBar}
                    onCheckedChange={setShowStatusBar}
                >
                    Status Bar
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={panel} onValueChange={setPanel}>
                    <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="side">Side</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>More Tools</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={onSubItemClick}>Save Page As...</DropdownMenuItem>
                        <DropdownMenuItem>Create Shortcut...</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

describe('DropdownMenu Component', () => {
    it('should open, handle item clicks, and close the menu', async () => {
        const user = userEvent.setup()
        const onItemClickMock = jest.fn()
        render(<TestDropdown onItemClick={onItemClickMock} />)

        const trigger = screen.getByRole('button', { name: /open menu/i })
        
        await user.click(trigger)
        const profileItem = await screen.findByText('Profile')
        expect(profileItem).toBeInTheDocument()

        await user.click(profileItem)

        expect(onItemClickMock).toHaveBeenCalledTimes(1)

        await waitFor(() => {
            expect(screen.queryByText('Profile')).not.toBeInTheDocument()
        })
    })

    it('should toggle checkbox items correctly', async () => {
        const user = userEvent.setup()
        render(<TestDropdown />)
        const trigger = screen.getByRole('button', { name: /open menu/i })

        await user.click(trigger)
        let statusBarItem = await screen.findByRole('menuitemcheckbox', { name: /status bar/i })
        expect(statusBarItem).toBeChecked()

        await user.click(statusBarItem)
        await waitFor(() => {
            expect(screen.queryByText('Status Bar')).not.toBeInTheDocument()
        })

        await user.click(trigger)
        statusBarItem = await screen.findByRole('menuitemcheckbox', { name: /status bar/i })
        expect(statusBarItem).not.toBeChecked()
    })

    it('should handle radio item selection correctly', async () => {
        const user = userEvent.setup()
        render(<TestDropdown />)
        const trigger = screen.getByRole('button', { name: /open menu/i })

        await user.click(trigger)
        let sideRadio = await screen.findByRole('menuitemradio', { name: /side/i })
        let topRadio = screen.getByRole('menuitemradio', { name: /top/i })
        expect(sideRadio).toBeChecked()
        expect(topRadio).not.toBeChecked()

        await user.click(topRadio)
        await waitFor(() => {
            expect(screen.queryByText('Side')).not.toBeInTheDocument()
        })

        await user.click(trigger)
        sideRadio = await screen.findByRole('menuitemradio', { name: /side/i })
        topRadio = screen.getByRole('menuitemradio', { name: /top/i })
        expect(sideRadio).not.toBeChecked()
        expect(topRadio).toBeChecked()
    })
})
