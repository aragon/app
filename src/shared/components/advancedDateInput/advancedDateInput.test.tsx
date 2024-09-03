import { render, screen } from '@testing-library/react';
import { type ICreateProposalFormFixedDateTime, type IAdvancedDateInputProps } from './types';
import { AdvancedDateInput } from './advancedDateInput';
import {userEvent} from '@testing-library/user-event';
import { FormWrapper } from '@/shared/testUtils';

describe('<AdvancedDateInput /> component', () => {
  const createTestComponent = (props?: Partial<IAdvancedDateInputProps>) => {
    const completeProps: IAdvancedDateInputProps = {
      label: 'Test Label',
      field: 'testField',
      helpText: 'Test Help Text',
      ...props,
    };

    return (
      <FormWrapper>
        <AdvancedDateInput {...completeProps} />
      </FormWrapper>
    );
  };

  it('renders the component with default props', () => {
    render(createTestComponent());

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

 it('renders switches between input modes', async () => {
    render(createTestComponent({ useDuration: true }));

    const durationRadio = screen.getByRole('radio', { name: /shared.advancedDateInput.duration/ });
    const fixedRadio = screen.getByRole('radio', { name: /shared.advancedDateInput.specific/ });

    // Check initial state
    expect(durationRadio.getAttribute('aria-checked')).toBe('false');
    expect(fixedRadio.getAttribute('aria-checked')).toBe('false');

    // Switch to fixed mode
    await userEvent.click(fixedRadio);
    expect(fixedRadio.getAttribute('aria-checked')).toBe('true');
    expect(durationRadio.getAttribute('aria-checked')).toBe('false');
    expect(screen.getByLabelText(/shared.advancedDateInput.date/)).toBeInTheDocument();
    expect(screen.getByLabelText(/shared.advancedDateInput.time/)).toBeInTheDocument();

    // Switch to duration mode
    await userEvent.click(durationRadio);
    expect(durationRadio.getAttribute('aria-checked')).toBe('true');
    expect(fixedRadio.getAttribute('aria-checked')).toBe('false');
  });

  it('validates fixed date-time input for end time', async () => {
    const startTime: ICreateProposalFormFixedDateTime = { date: '2024-09-01', time: '12:00' };

    render(createTestComponent({
      label: 'End Time',
      field: 'endTime',
      helpText: 'Select the end time',
      infoText: 'End time must be after start time',
      minDuration: 3600, // 1 hour
      useDuration: false,
      startTime,
      isStartField: false
    }));

    // Switch to fixed mode
    await userEvent.click(screen.getByRole('radio', { name: /shared.advancedDateInput.specific/ }));

    const dateInput = screen.getByLabelText(/shared.advancedDateInput.date/);
    const timeInput = screen.getByLabelText(/shared.advancedDateInput.time/);
    const alert = screen.getByRole('alert');
    expect(dateInput).toBeInTheDocument();
    expect(timeInput).toBeInTheDocument();
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('End time must be after start time');
    // Set an end time less than minDuration from start time
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, '2024-09-01');
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, '12:30');
    // Wait for validation to occur
     expect(alert).toHaveTextContent(/shared.advancedDateInput.invalid \(label=End Time\)/);

  });

  it('validates duration input', async () => {
    const user = userEvent.setup();
    render(createTestComponent({
      label: 'Duration',
      field: 'duration',
      helpText: 'Set the duration',
      infoText: 'Minimum duration is 1 hour',
      minDuration: 3600, // 1 hour
      useDuration: true,
      isStartField: false
    }));

     await user.click(screen.getByRole('radio', { name: /shared.advancedDateInput.duration/ }));


    const minutesInput = screen.getByLabelText(/shared.advancedDateInput.minutes/);
    const hoursInput = screen.getByLabelText(/shared.advancedDateInput.hours/);
    const daysInput = screen.getByLabelText(/shared.advancedDateInput.days/);
    const alert = screen.getByRole('alert');

    expect(minutesInput).toBeInTheDocument();
    expect(hoursInput).toBeInTheDocument();
    expect(daysInput).toBeInTheDocument();
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Minimum duration is 1 hour');

    // Set a duration less than minDuration
    await user.clear(minutesInput);
    await user.clear(hoursInput);
    await user.clear(daysInput);
    await user.type(minutesInput, '30');

    expect(alert).toHaveTextContent(/shared.advancedDateInput.invalid \(label=Duration\)/);

    // Set a valid duration
    await user.clear(hoursInput);
    await user.type(hoursInput, '2');

    expect(alert).toHaveTextContent('Minimum duration is 1 hour');
  });

  it('handles start time prop correctly', async () => {
    const startTime: ICreateProposalFormFixedDateTime = { date: '2024-09-01', time: '10:00' };
    render(createTestComponent({
      label: 'End Time',
      field: 'endTime',
      helpText: 'Set the end time',
      infoText: 'End time must be after start time',
      minDuration: 3600, // 1 hour
      useDuration: false,
      startTime,
      isStartField: false
    }));

    // Switch to fixed mode
    await userEvent.click(screen.getByRole('radio', { name: /shared.advancedDateInput.specific/ }));

    const dateInput = screen.getByLabelText(/shared.advancedDateInput.date/);
    const timeInput = screen.getByLabelText(/shared.advancedDateInput.time/);
    const alert = screen.getByRole('alert');

    expect(dateInput).toBeInTheDocument();
    expect(timeInput).toBeInTheDocument();
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('End time must be after start time');

    // Set a date-time less than minDuration from startTime
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, '2024-09-01');
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, '10:30');

    expect(alert).toHaveTextContent(/shared.advancedDateInput.invalid \(label=End Time\)/);

    // Set a valid date-time
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, '2024-09-01');
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, '11:30');

    expect(alert).toHaveTextContent('End time must be after start time');
  });
});
