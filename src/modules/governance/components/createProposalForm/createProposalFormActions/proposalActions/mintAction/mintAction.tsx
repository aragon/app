import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import type { IProposalActionData } from '../../../createProposalFormDefinitions';

export interface IMintActionProps extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

export const MintAction: React.FC<IMintActionProps> = (props) => {
    return <div>MINT ACTION</div>;
};
