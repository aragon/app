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

    it('renders the approval-threshold item of approving bodies when the stage threshold is set', () => {
        render(createTestComponent({ stageThreshold: 2 }));

        expect(screen.getByText(/approvalThreshold/)).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders the veto-threshold item of vetoing bodies when the stage threshold is set', () => {
        render(
            createTestComponent({
                proposalType: SppProposalType.VETO,
                stageThreshold: 1,
            }),
        );

        expect(screen.getByText(/vetoThreshold/)).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('does not render the threshold item without a stage threshold', () => {
        render(createTestComponent());

        expect(screen.queryByText(/approvalThreshold/)).not.toBeInTheDocument();
    });
});
