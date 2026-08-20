import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { type IMpcOtpInputProps, MpcOtpInput } from './mpcOtpInput';

describe('<MpcOtpInput /> component', () => {
    const createTestComponent = (props?: Partial<IMpcOtpInputProps>) => {
        const completeProps: IMpcOtpInputProps = {
            value: '',
            onChange: jest.fn(),
            label: 'Authenticator code',
            ...props,
        };

        return <MpcOtpInput {...completeProps} />;
    };

    // Controlled wrapper: the component renders the value owned by its parent.
    const ControlledOtpInput = (props?: Partial<IMpcOtpInputProps>) => {
        const [value, setValue] = useState('');

        return (
            <MpcOtpInput
                label="Authenticator code"
                {...props}
                onChange={(newValue) => {
                    setValue(newValue);
                    props?.onChange?.(newValue);
                }}
                value={value}
            />
        );
    };

    it('renders 6 digit boxes with the group label', () => {
        render(createTestComponent());
        expect(screen.getByText('Authenticator code')).toBeInTheDocument();
        expect(screen.getAllByRole('textbox')).toHaveLength(6);
    });

    it('collects typed digits, ignores non-digits and calls onComplete when full', async () => {
        const onComplete = jest.fn();
        render(<ControlledOtpInput onComplete={onComplete} />);

        const [firstBox] = screen.getAllByRole('textbox');
        await userEvent.type(firstBox, '1a2b3c456');

        expect(onComplete).toHaveBeenCalledWith('123456');
    });

    it('fills all boxes on paste', async () => {
        const onChange = jest.fn();
        render(<ControlledOtpInput onChange={onChange} />);

        const [firstBox] = screen.getAllByRole('textbox');
        await userEvent.click(firstBox);
        await userEvent.paste('987654');

        expect(onChange).toHaveBeenLastCalledWith('987654');
        expect(
            screen
                .getAllByRole('textbox')
                .map((box) => (box as HTMLInputElement).value),
        ).toEqual(['9', '8', '7', '6', '5', '4']);
    });

    it('removes the last digit on backspace', async () => {
        const onChange = jest.fn();
        render(<ControlledOtpInput onChange={onChange} />);

        const boxes = screen.getAllByRole('textbox');
        await userEvent.type(boxes[0], '12');
        await userEvent.type(boxes[1], '{backspace}');

        expect(onChange).toHaveBeenLastCalledWith('1');
    });

    it('renders the error message over the help text', () => {
        render(
            createTestComponent({
                helpText: 'help-text',
                errorMessage: 'error-message',
            }),
        );
        expect(screen.getByText('error-message')).toBeInTheDocument();
        expect(screen.queryByText('help-text')).not.toBeInTheDocument();
    });
});
