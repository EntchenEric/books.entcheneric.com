import { render, screen } from '@testing-library/react'
import { Skeleton } from "@/components/ui/skeleton"

describe('Skeleton', () => {
  it('should render with the default skeleton classes', () => {
    render(<Skeleton />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('bg-accent')
    expect(skeleton).toHaveClass('animate-pulse')
    expect(skeleton).toHaveClass('rounded-md')
  })

  it('should apply additional custom classes', () => {
    const customClasses = 'h-12 w-12 rounded-full'
    render(<Skeleton className={customClasses} />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('bg-accent')
    expect(skeleton).toHaveClass('h-12 w-12 rounded-full')
  })

  it('should forward other HTML attributes', () => {
    const id = 'user-avatar-skeleton'
    render(<Skeleton id={id} />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveAttribute('id', id)
  })
})