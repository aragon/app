import { withdrawActions } from '@/modules/proposalActions/actions/proposalActionWithdrawToken/mocks';
import { ProposalActions } from '@/modules/proposalActions/proposalActions';

export const UsageExample: React.FC = () => {
    return <ProposalActions actions={withdrawActions} />;
};
