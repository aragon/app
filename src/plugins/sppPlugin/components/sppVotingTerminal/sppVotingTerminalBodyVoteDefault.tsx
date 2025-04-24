import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import type { ISetupBodyFormExternal } from '../../../../modules/createDao/dialogs/setupBodyDialog';
import { SppPluginDialogId } from '../../constants/sppPluginDialogId';
import type { ISppProposal } from '../../types';

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
     * External body.
     */
    externalBody: ISetupBodyFormExternal;
    /**
     *  Defines if the vote is to approve or veto the proposal.
     */
    isVeto: boolean;
}

export const SppVotingTerminalBodyVoteDefault: React.FC<ISppVotingTerminalBodyVoteDefaultProps> = (props) => {
    const { daoId, proposal, isVeto, externalBody } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { address } = useAccount();

    const voted = false;

    const openTransactionDialog = () => {
        const vote = { label: 'reject' as const };
        const params: IVoteDialogParams = { daoId, proposal, vote, isVeto, plugin: {} };
        open(SppPluginDialogId.REPORT_PROPOSAL_RESULT, { params });
    };

    const checkPermissions = () => {
        if (address !== externalBody.address) {
            open(SppPluginDialogId.INVALID_ADDRESS_CONNECTED, { params: {} });
            return;
        }
        openTransactionDialog();
    };

    const voteLabel = voted ? (isVeto ? 'vetoed' : 'approved') : isVeto ? 'veto' : 'approve';

    const handleVoteClick = () => checkPermissions();

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
