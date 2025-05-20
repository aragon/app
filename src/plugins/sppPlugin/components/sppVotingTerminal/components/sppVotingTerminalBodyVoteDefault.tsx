import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { SppPluginDialogId } from '@/plugins/sppPlugin/constants/sppPluginDialogId';
import { type ISppReportProposalResultDialogParams } from '@/plugins/sppPlugin/dialogs/sppReportProposalResultDialog';
import { type ISppProposal, type ISppStage } from '@/plugins/sppPlugin/types';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { addressUtils, Button, IconType } from '@aragon/gov-ui-kit';
import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

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
     * Stage on which the body is setup.
     */
    stage: ISppStage;
}

export const SppVotingTerminalBodyVoteDefault: React.FC<ISppVotingTerminalBodyVoteDefaultProps> = (props) => {
    const { daoId, proposal, externalAddress, stage } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { address } = useAccount();
    const latestAddress = useRef(address);

    useEffect(() => {
        // Using latestAddress ref to avoid closure issues with capturing stale address state.
        // This ensures checkPermissions() uses the updated address after wallet connection.
        latestAddress.current = address;
    }, [address]);

    const { check: checkWalletConnection } = useConnectedWalletGuard();

    const isVeto = sppStageUtils.isVeto(stage);
    const voted = sppStageUtils.getBodyResult(proposal, externalAddress, stage.stageIndex) != null;

    const openTransactionDialog = () => {
        const params: ISppReportProposalResultDialogParams = { daoId, proposal, isVeto };
        open(SppPluginDialogId.REPORT_PROPOSAL_RESULT, { params });
    };

    const checkPermissions = () => {
        if (!addressUtils.isAddressEqual(latestAddress.current, externalAddress)) {
            open(SppPluginDialogId.INVALID_ADDRESS_CONNECTED);
            return;
        }
        openTransactionDialog();
    };

    const voteLabel = voted ? (isVeto ? 'vetoed' : 'approved') : isVeto ? 'veto' : 'approve';

    const handleVoteClick = () => checkWalletConnection({ onSuccess: checkPermissions });

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
                <p className="text-center text-sm leading-normal font-normal text-neutral-500 md:text-left">
                    {t('app.plugins.spp.sppVotingTerminalBodyVoteDefault.helpText')}
                </p>
            )}
        </div>
    );
};
