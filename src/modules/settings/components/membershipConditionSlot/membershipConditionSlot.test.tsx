import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IConditionData } from '@/modules/settings/types';
import { MembershipConditionSlot } from './membershipConditionSlot';

describe('<MembershipConditionSlot /> component', () => {
    const createTestComponent = (props?: Partial<IConditionData>) => {
        const completeProps: IConditionData = {
            conditionType: 'membership',
            ...props,
        };

        return (
            <GukModulesProvider>
                <MembershipConditionSlot {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders "true" when the multisig gates proposal creation to members', () => {
        render(createTestComponent({ onlyListed: true }));

        expect(
            screen.getByText(/membershipConditionSlot.memberOfMultisig/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/membershipConditionSlot.true/),
        ).toBeInTheDocument();
    });

    it('renders "false" when membership is not enforced', () => {
        render(createTestComponent({ onlyListed: false }));

        expect(
            screen.getByText(/membershipConditionSlot.false/),
        ).toBeInTheDocument();
    });
});
