import { render, screen } from '@testing-library/react';
import { Separator } from '@/components/ui/separator';

describe('Separator', () => {
  it('should render a horizontal separator by default', () => {
    render(<Separator />);
    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('should render a vertical separator when specified', () => {
    render(<Separator orientation="vertical" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  it('should apply additional custom classes', () => {
    render(<Separator className="my-4" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('my-4');
  });
});