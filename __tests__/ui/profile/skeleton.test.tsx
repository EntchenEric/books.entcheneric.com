import { render, screen } from '@testing-library/react'
import ProfilePageSkeleton from '@/app/ui/profile/skeleton'

describe('ProfilePageSkeleton', () => {
    it('should render skeleton placeholders', () => {
        render(<ProfilePageSkeleton />)
        const skeletons = screen.getAllByTestId('skeleton')
        expect(skeletons.length).toBeGreaterThan(0)
    })
})
