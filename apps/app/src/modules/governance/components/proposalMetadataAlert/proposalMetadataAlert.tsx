import { AlertInline } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IProposal } from '../../api/governanceService';
import {
    ProposalMetadataStatus,
    proposalUtils,
} from '../../utils/proposalUtils';

export interface IProposalMetadataAlertProps {
    /** Proposal whose metadata is displayed on the card. */
    proposal: IProposal;
}

export const ProposalMetadataAlert: React.FC<IProposalMetadataAlertProps> = (
    props,
) => {
    const { proposal } = props;
    const { t } = useTranslations();

    const metadataStatus = proposalUtils.getMetadataStatus(proposal);

    if (metadataStatus === ProposalMetadataStatus.STANDARD) {
        return null;
    }

    const message =
        metadataStatus === ProposalMetadataStatus.MISSING
            ? t('app.governance.proposalMetadataAlert.missing')
            : t('app.governance.proposalMetadataAlert.nonStandard');

    return <AlertInline message={message} variant="warning" />;
};
