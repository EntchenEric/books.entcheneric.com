import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

jest.useFakeTimers()

const TestTooltip = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button>Trigger</button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Content</p>
    </TooltipContent>
  </Tooltip>
)

describe('Tooltip', () => {
  it('should be hidden on initial render', () => {
    render(<TestTooltip />)
    expect(screen.queryByText('Trigger')).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('should show on hover and hide on unhover', async () => {
    jest.useFakeTimers();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<TestTooltip />);

    const triggerElement = screen.getByText('Trigger');

    await user.hover(triggerElement);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();

    await user.unhover(triggerElement);

    expect(screen.queryByRole('Content')).not.toBeInTheDocument();
  });
})