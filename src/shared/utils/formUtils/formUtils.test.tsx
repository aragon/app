import { type FieldValues, type UseControllerReturn } from 'react-hook-form';
import { formUtils } from './formUtils';

describe('form utils', () => {
    it('trims the value and calls onChange with the trimmed value', () => {
        const mockOnChange = jest.fn();
        const mockOnBlur = jest.fn();

        const mockField = {
            onChange: mockOnChange,
            onBlur: mockOnBlur,
        } as unknown as UseControllerReturn<FieldValues, string>['field'];

        const mockEvent = {
            target: {
                value: '  some text  ',
            },
        } as React.FocusEvent<HTMLInputElement>;

        formUtils.trimOnBlur({ event: mockEvent, field: mockField });

        expect(mockOnChange).toHaveBeenCalledWith('some text');
        expect(mockOnBlur).toHaveBeenCalled();
    });
});
