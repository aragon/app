import type {
    IProposalAction,
    IProposalActionComponentProps,
} from '@aragon/gov-ui-kit';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';

export interface ICapitalDistributorCreateCampaignActionCreateProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction, unknown>
    > {}

export const CapitalDistributorCreateCampaignActionCreate: React.FC<
    ICapitalDistributorCreateCampaignActionCreateProps
> = () => {
    return <h1>capitalDistributorCreateCampaignActionCreate</h1>;
};
