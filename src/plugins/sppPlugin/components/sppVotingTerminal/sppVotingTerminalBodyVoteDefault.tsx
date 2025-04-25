import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { addressUtils, Button, IconType } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import { useConnectedWalletGuard } from '../../../../modules/application/hooks/useConnectedWalletGuard';
import { SppPluginDialogId } from '../../constants/sppPluginDialogId';
import type { ISppReportProposalResultDialogParams } from '../../dialogs/sppReportProposalResultDialog';
import type { ISppProposal } from '../../types';
import { sppProposalUtils } from '../../utils/sppProposalUtils';

export interface ISppVotingTerminalBodyVoteDefaultProps {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * Proposal to submit the vote for.
     */
    proposal: ISppProposal;
    /**
     * External body address.
     */
    externalAddress: string;
    /**
     * Index of the stage on which external body is located.
     */
    stageIndex: number;
    /**
     * Defines if the vote is to approve or veto the proposal.
     */
    isVeto: boolean;
}

export const SppVotingTerminalBodyVoteDefault: React.FC<ISppVotingTerminalBodyVoteDefaultProps> = (props) => {
    const { daoId, proposal, isVeto, externalAddress, stageIndex } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { address } = useAccount();

    const { check: checkWalletConnection, result: isConnected } = useConnectedWalletGuard();

    const voted = sppProposalUtils.getExternalBodyResult(proposal, externalAddress, stageIndex) != null;

    const openTransactionDialog = () => {
        const params: ISppReportProposalResultDialogParams = { daoId, proposal, isVeto };
        open(SppPluginDialogId.REPORT_PROPOSAL_RESULT, { params });
    };

    const checkPermissions = () => {
        if (!addressUtils.isAddressEqual(address, externalAddress)) {
            open(SppPluginDialogId.INVALID_ADDRESS_CONNECTED, { params: {} });
            return;
        }
        openTransactionDialog();
    };

    const voteLabel = voted ? (isVeto ? 'vetoed' : 'approved') : isVeto ? 'veto' : 'approve';

    const handleVoteClick = () => {
        if (!isConnected) {
            checkWalletConnection();
            return;
        }

        checkPermissions();
    };

    return (
        <div className="flex w-full flex-col gap-3">
            <Button
                onClick={voted ? undefined : handleVoteClick}
                size="md"
                iconLeft={voted ? IconType.CHECKMARK : undefined}
                variant={voted ? 'secondary' : 'primary'}
                className="w-full md:w-fit"
            >
                {t(`app.plugins.spp.sppVotingTerminalBodyVoteDefault.${voteLabel}`)}
            </Button>
            {!voted && (
                <p className="text-center text-sm font-normal leading-normal text-neutral-500 md:text-left">
                    {t('app.plugins.spp.sppVotingTerminalBodyVoteDefault.helpText')}
                </p>
            )}
        </div>
    );
};
