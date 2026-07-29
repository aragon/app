import { render, screen } from '@testing-library/react';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import {
    GovernanceBodyDecisionItem,
    type IGovernanceBodyDecisionItemProps,
} from './governanceBodyDecisionItem';

describe('<GovernanceBodyDecisionItem /> component', () => {
    const createTestComponent = (
        props?: Partial<IGovernanceBodyDecisionItemProps>,
    ) => (
        <dl>
            <GovernanceBodyDecisionItem
                isAdvancedGovernance={true}
                {...props}
            />
        </dl>
    );

    it('renders the veto decision with its description for vetoing bodies', () => {
        render(createTestComponent({ proposalType: SppProposalType.VETO }));

        expect(
            screen.getByText(/proposalTypeField.veto.label/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/proposalTypeField.veto.description/),
        ).toBeInTheDocument();
    });

    it('defaults to the approve decision when the proposal type is not set', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/proposalTypeField.approve.label/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/proposalTypeField.approve.description/),
        ).toBeInTheDocument();
    });

    it('renders nothing when the governance is not advanced', () => {
        render(createTestComponent({ isAdvancedGovernance: false }));

        expect(
            screen.queryByText(/proposalTypeField.approve.label/),
        ).not.toBeInTheDocument();
    });
});
