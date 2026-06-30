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

    it('renders the target and the list of allowed selectors from the payload', () => {
        render(
            createTestComponent({
                target: '0xTarget',
                selectors: ['0xaaaaaaaa', '0xbbbbbbbb'],
            }),
        );

        expect(screen.getByText('0xTarget')).toBeInTheDocument();
        expect(screen.getByText('0xaaaaaaaa')).toBeInTheDocument();
        expect(screen.getByText('0xbbbbbbbb')).toBeInTheDocument();
    });

    it('shows the no allowed actions fallback when selectors are absent', () => {
        render(createTestComponent({ selectors: undefined }));

        expect(
            screen.getByText(/executeSelectorConditionSlot.noActions/),
        ).toBeInTheDocument();
    });

    it('ignores non-string selector entries when narrowing the payload', () => {
        render(
            createTestComponent({
                selectors: ['0xaaaaaaaa', 42, null, ''],
            }),
        );

        expect(screen.getByText('0xaaaaaaaa')).toBeInTheDocument();
        expect(
            screen.queryByText(/executeSelectorConditionSlot.noActions/),
        ).not.toBeInTheDocument();
    });
});
