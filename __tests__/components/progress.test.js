import { render, screen } from '@testing-library/react'
import { Progress } from '@/components/ui/progress'

describe('Progress Component', () => {
    it('should render the progress bar with the correct value', () => {
        const testValue = 50
        render(<Progress value={testValue} />)
        const progressBar = screen.getByRole('progressbar')
        const progressIndicator = progressBar.firstChild
        expect(progressIndicator).toHaveStyle(`transform: translateX(-${100 - testValue}%)`)
    })

    it('should default to 0 when no value is provided', () => {
        render(<Progress />)
        const progressBar = screen.getByRole('progressbar')
        const progressIndicator = progressBar.firstChild
        expect(progressIndicator).toHaveStyle('transform: translateX(-100%)')
    })

    it('should update the progress when the value prop changes', () => {
        const initialValue = 25
        const { rerender } = render(<Progress value={initialValue} />)
        const progressBar = screen.getByRole('progressbar')
        const progressIndicator = progressBar.firstChild
        expect(progressIndicator).toHaveStyle(`transform: translateX(-${100 - initialValue}%)`)
        const updatedValue = 75
        rerender(<Progress value={updatedValue} />)
        expect(progressIndicator).toHaveStyle(`transform: translateX(-${100 - updatedValue}%)`)
    })
    
    it('should handle a value of 0 correctly', () => {
        const testValue = 0
        render(<Progress value={testValue} />)
        const progressBar = screen.getByRole('progressbar')
        const progressIndicator = progressBar.firstChild
        expect(progressIndicator).toHaveStyle('transform: translateX(-100%)')
    })

    it('should handle a value of 100 correctly', () => {
        const testValue = 100
        render(<Progress value={testValue} />)
        const progressBar = screen.getByRole('progressbar')
        const progressIndicator = progressBar.firstChild
        expect(progressIndicator).toHaveStyle('transform: translateX(-0%)')
    })
})
