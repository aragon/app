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

    it('renders the truncated token address and the minimum voting power', () => {
        render(
            createTestComponent({
                token: '0x0bA45A8b5d5575935B8158a88C631E9F9C95a2e5',
                minVotingPower: '1000000000000000000',
            }),
        );

        expect(
            screen.getByText(/votingPowerConditionSlot.token/),
        ).toBeInTheDocument();
        expect(screen.getByText('0x0bA4…a2e5')).toBeInTheDocument();
        expect(
            screen.getByText(/votingPowerConditionSlot.minVotingPower/),
        ).toBeInTheDocument();
        expect(screen.getByText('1000000000000000000')).toBeInTheDocument();
    });

    it('falls back to a placeholder when payload fields are absent', () => {
        render(
            createTestComponent({
                token: undefined,
                minVotingPower: undefined,
            }),
        );

        expect(screen.getAllByText('—')).toHaveLength(2);
    });
});
