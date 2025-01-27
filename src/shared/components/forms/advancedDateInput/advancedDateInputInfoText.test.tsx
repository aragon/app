import type { IUseFormFieldReturn } from '@/shared/hooks/useFormField';
import type { IDateFixed } from '@/shared/utils/dateUtils';
import { IconType } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { AdvancedDateInputInfoText, type IAdvancedDateInputInfoTextProps } from './advancedDateInputInfoText';

describe('<AdvancedDateInputInfoText /> component', () => {
    const createTestComponent = (props?: Partial<IAdvancedDateInputInfoTextProps>) => {
        const completeProps: IAdvancedDateInputInfoTextProps = {
            field: {} as unknown as IUseFormFieldReturn<Record<string, IDateFixed>, string>,
            ...props,
        };

        return <AdvancedDateInputInfoText {...completeProps} />;
    };

    it('returns null when field has no alert and infoText is not set', () => {
        const field = { alert: null } as unknown as IUseFormFieldReturn<Record<string, IDateFixed>, string>;
        const infoText = undefined;
        const { container } = render(createTestComponent({ field, infoText }));
        expect(container).toBeEmptyDOMElement();
    });

    it('renders a card alert with the specified infoText and field label when infoDisplay is set to card', () => {
        const infoText = 'info-test';
        const field = { label: 'label-test' } as unknown as IUseFormFieldReturn<Record<string, IDateFixed>, string>;
        const infoDisplay = 'card';
        render(createTestComponent({ infoText, field, infoDisplay }));
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByTestId(IconType.INFO)).toBeInTheDocument();
        expect(screen.getByText(field.label!)).toBeInTheDocument();
        expect(screen.getByText(infoText)).toBeInTheDocument();
    });

    it('renders an inline alert with only the specified infoText when infoDisplay is set to inline', () => {
        const infoText = 'inline-text';
        const field = { label: 'label-test' } as unknown as IUseFormFieldReturn<Record<string, IDateFixed>, string>;
        const infoDisplay = 'inline';
        render(createTestComponent({ infoText, field, infoDisplay }));
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByTestId(IconType.INFO)).toBeInTheDocument();
        expect(screen.queryByText(field.label!)).not.toBeInTheDocument();
        expect(screen.getByText(infoText)).toBeInTheDocument();
    });

    it('renders the field alert with a critical variant when field is not valid', () => {
        const infoText = 'hidden-info';
        const field = { alert: { message: 'invalid-field' }, label: 'field' } as unknown as IUseFormFieldReturn<
            Record<string, IDateFixed>,
            string
        >;
        render(createTestComponent({ infoText, field }));
        expect(screen.queryByText(infoText)).not.toBeInTheDocument();
        expect(screen.getByText(field.alert!.message)).toBeInTheDocument();
        expect(screen.getByTestId(IconType.CRITICAL)).toBeInTheDocument();
    });
});
