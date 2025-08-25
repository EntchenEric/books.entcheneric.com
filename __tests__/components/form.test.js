import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { describe, it, expect, jest } from '@jest/globals';

import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from '@/components/ui/form';

const Input = (props) => <input {...props} />;

const testSchema = z.object({
  username: z.string().min(3, { message: 'Username is too short.' }),
});

const TestForm = ({ onSubmit }) => {
  const form = useForm({
    resolver: zodResolver(testSchema),
    defaultValues: {
      username: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(data => onSubmit(data))} data-testid="form">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
};

describe('Generic Form Components', () => {
  
  it('should render correctly and link elements with ARIA attributes on initial load', () => {
    render(<TestForm onSubmit={jest.fn()} />);

    const label = screen.getByText('Username');
    const input = screen.getByLabelText('Username');
    const description = screen.getByText('This is your public display name.');

    expect(input.id).toBe(label.getAttribute('for'));

    expect(input.getAttribute('aria-describedby')).toBe(description.id);

    expect(input).toHaveAttribute('aria-invalid', 'false');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  
  it('should display a validation error message and update ARIA attributes upon invalid submission', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();
    render(<TestForm onSubmit={mockSubmit} />);

    const input = screen.getByLabelText('Username');
    const description = screen.getByText('This is your public display name.');
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await user.type(input, 'hi');
    await user.click(submitButton);

    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent('Username is too short.');

    expect(input).toHaveAttribute('aria-invalid', 'true');

    const describedByIds = input.getAttribute('aria-describedby');
    expect(describedByIds).toContain(description.id);
    expect(describedByIds).toContain(errorMessage.id);
    
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('should not display an error and should call onSubmit with valid data', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();
    render(<TestForm onSubmit={mockSubmit} />);
    
    const input = screen.getByLabelText('Username');
    const submitButton = screen.getByRole('button', { name: /submit/i });

    const validUsername = 'ValidUser';
    await user.type(input, validUsername);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('should clear the error message after correcting an invalid input', async () => {
    const user = userEvent.setup();
    render(<TestForm onSubmit={jest.fn()} />);

    const input = screen.getByLabelText('Username');
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await user.type(input, 'a');
    await user.click(submitButton);
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'corrected-user');
    
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});