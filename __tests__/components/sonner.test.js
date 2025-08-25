import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toaster } from '@/components/ui/sonner'
import { toast } from "sonner"

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});


describe('Sonner', () => {
    it('should send toast', () => {
        render(<Toaster />)

        toast('Toast')
        expect(screen.findByText('Toast'))
    })
    
    it('should send toast with description', () => {
        render(<Toaster />)

        toast.message('Toast', {
            description: "Description"
        })
        expect(screen.findByText('Toast'))
        expect(screen.findByText('Description'))
    })
})