import { render, screen } from '@testing-library/react';
import { FormWrapper } from '@/shared/testUtils';
import { NumberProgressInput } from './numberProgressInput';
import type { INumberProgressInputProps } from './numberProgressInput.api';

describe('<NumberProgressInput /> component', () => {
    const createTestComponent = (
        props?: Partial<INumberProgressInputProps>,
    ) => {
        const completeProps: INumberProgressInputProps = {
            fieldName: 'threshold',
            label: 'Threshold',
            total: 3,
            defaultValue: 1,
            ...props,
        };

        return (
            <FormWrapper>
                <NumberProgressInput {...completeProps} />
            </FormWrapper>
        );
    };

    it('repeats the label on the number input by default', () => {
        render(createTestComponent());
        expect(screen.getAllByText('Threshold')).toHaveLength(2);
    });

    it('labels the number input with the field label only when hideInputLabel is set', () => {
        render(createTestComponent({ hideInputLabel: true }));
        expect(screen.getAllByText('Threshold')).toHaveLength(1);
        expect(screen.getByRole('textbox', { name: 'Threshold' })).toHaveValue(
            '1',
        );
    });

    it('renders the total label below the progress', () => {
        render(createTestComponent({ totalLabel: '1 of 3 must approve' }));
        expect(screen.getByText('1 of 3 must approve')).toBeInTheDocument();
    });
});
