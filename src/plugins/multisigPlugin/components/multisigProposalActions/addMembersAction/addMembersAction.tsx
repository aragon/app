import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';

export interface IAddMembersActionProps extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

const addMembersAbi = {
    type: 'function',
    inputs: [{ name: '_members', internalType: 'address[]', type: 'address[]' }],
    name: 'addAddresses',
    outputs: [],
    stateMutability: 'nonpayable',
};

export const AddMembersAction: React.FC<IAddMembersActionProps> = (props) => {
    const { index, action } = props;

    return <div>AddMembersAction</div>;
};
