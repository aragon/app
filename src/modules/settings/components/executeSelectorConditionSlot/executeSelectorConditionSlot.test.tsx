import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IConditionData } from '@/modules/settings/types';
import { ExecuteSelectorConditionSlot } from './executeSelectorConditionSlot';

describe('<ExecuteSelectorConditionSlot /> component', () => {
    const createTestComponent = (props?: Partial<IConditionData>) => {
        const completeProps: IConditionData = {
            conditionType: 'execute-selector',
            ...props,
        };

        return (
            <GukModulesProvider>
                <ExecuteSelectorConditionSlot {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the description and the selectors mapped to their truncated targets', () => {
        render(
            createTestComponent({
                selectors: ['0xa9059cbb', '0x23b872dd'],
                targets: [
                    '0x0bA45A8b5d5575935B8158a88C631E9F9C95a2e5',
                    '0xDe0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
                ],
            }),
        );

        expect(
            screen.getByText(/executeSelectorConditionSlot.description/),
        ).toBeInTheDocument();
        expect(screen.getByText('0xa9059cbb')).toBeInTheDocument();
        expect(screen.getByText('0x0bA4…a2e5')).toBeInTheDocument();
        expect(screen.getByText('0x23b872dd')).toBeInTheDocument();
        expect(screen.getByText('0xDe0B…7BAe')).toBeInTheDocument();
    });

    it('shows the no allowed actions fallback when selectors are absent', () => {
        render(createTestComponent({ selectors: undefined }));

        expect(
            screen.getByText(/executeSelectorConditionSlot.noActions/),
        ).toBeInTheDocument();
    });

    it('ignores non-string selector entries when narrowing the payload', () => {
        render(
            createTestComponent({ selectors: ['0xaaaaaaaa', 42, null, ''] }),
        );

        expect(screen.getByText('0xaaaaaaaa')).toBeInTheDocument();
        expect(
            screen.queryByText(/executeSelectorConditionSlot.noActions/),
        ).not.toBeInTheDocument();
    });

    it('renders a placeholder target when no matching target is provided', () => {
        render(createTestComponent({ selectors: ['0xaaaaaaaa'], targets: [] }));

        expect(screen.getByText('0xaaaaaaaa')).toBeInTheDocument();
        expect(screen.getByText('—')).toBeInTheDocument();
    });
});
