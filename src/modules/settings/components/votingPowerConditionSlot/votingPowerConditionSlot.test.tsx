import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IConditionData } from '@/modules/settings/types';
import { VotingPowerConditionSlot } from './votingPowerConditionSlot';

describe('<VotingPowerConditionSlot /> component', () => {
    const createTestComponent = (props?: Partial<IConditionData>) => {
        const completeProps: IConditionData = {
            conditionType: 'voting-power',
            ...props,
        };

        return (
            <GukModulesProvider>
                <VotingPowerConditionSlot {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the condition type and the pending placeholder copy', () => {
        render(createTestComponent({ conditionType: 'voting-power' }));

        expect(screen.getByText('voting-power')).toBeInTheDocument();
        expect(
            screen.getByText(/votingPowerConditionSlot.pending/),
        ).toBeInTheDocument();
    });
});
