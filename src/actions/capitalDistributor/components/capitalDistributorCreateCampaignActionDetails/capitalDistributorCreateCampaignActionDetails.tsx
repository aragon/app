import type {
    IProposalAction,
    IProposalActionComponentProps,
} from '@aragon/gov-ui-kit';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';

export interface ICapitalDistributorCreateCampaignActionDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

export const CapitalDistributorCreateCampaignActionDetails: React.FC<
    ICapitalDistributorCreateCampaignActionDetailsProps
> = () => {
    return <h1>capitalDistributorCreateCampaignActionDetails</h1>;
};
