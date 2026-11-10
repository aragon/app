'use client';

import {
    AlertCard,
    AlertInline,
    addressUtils,
    Button,
    Card,
    ChainEntityType,
    IconType,
    ProposalVoting,
    ProposalVotingTab,
    Tabs,
    useGukModulesContext,
} from '@aragon/gov-ui-kit';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { SafeMultisigProposalVotingBreakdownView } from '@/plugins/safeMultisigPlugin/components/safeMultisigProposalVotingBreakdown';
import { SafeMultisigVoteListView } from '@/plugins/safeMultisigPlugin/components/safeMultisigVoteList';
import {
    safeBodyPollInterval,
    safeQueueReadLimit,
} from '@/plugins/safeMultisigPlugin/constants';
import { safeMultisigSettingsUtils } from '@/plugins/safeMultisigPlugin/utils/safeMultisigSettingsUtils';
import type { Network } from '@/shared/api/daoService';
import {
    useSafeInfo,
    useSafePendingTransaction,
} from '@/shared/api/safeService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { SafeDialogId } from '../../constants/safeDialogId';
import type { ISafeTransactionDialogParams } from '../../dialogs/safeTransactionDialog';
import { SafeApprovalReadiness } from '../../types';
import { safeTransactionUtils } from '../../utils/safeTransactionUtils';

export interface ISafeTransactionVotingProps {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe the transaction belongs to.
     */
    safeAddress: string;
    /**
     * Hash of the queued Safe transaction.
     */
    safeTxHash: string;
    /**
     * Called once the transaction has been confirmed or executed, for the caller to refresh the queries it owns.
     */
    onSafeStateChange?: () => void;
}

const translationKey = 'app.safe.safeTransactionVoting';

/**
 * Confirmation progress, confirming owners and Safe settings of a queued Safe transaction, with the action the
 * connected owner can take on it: confirm it, or execute it once it holds enough confirmations on the current nonce.
 */
export const SafeTransactionVoting: React.FC<ISafeTransactionVotingProps> = (
    props,
) => {
    const { network, safeAddress, safeTxHash, onSafeStateChange } = props;

    const { t } = useTranslations();
    const { copy } = useGukModulesContext();
    const { open } = useDialogContext();
    const { address: connectedAddress } = useWalletAccount();
    const { check: checkWalletConnection } = useConnectedWalletGuard();
    const { buildEntityUrl } = useDaoChain({ network });

    // Owners confirm from anywhere, so both reads poll at the Safe body card's cadence.
    const queryOptions = { refetchInterval: safeBodyPollInterval };
    const { data: safeInfo, isError: isSafeInfoError } = useSafeInfo(
        { urlParams: { network, address: safeAddress } },
        queryOptions,
    );
    const { data: transaction, isError: isTransactionError } =
        useSafePendingTransaction(
            {
                urlParams: { network, address: safeAddress, safeTxHash },
                queryParams: { limit: safeQueueReadLimit },
            },
            queryOptions,
        );

    // Once executed, the transaction leaves the queue before the transaction list refreshes: it has nothing left to
    // confirm, so the card is not rendered rather than showing a misleading empty state.
    if (transaction === null) {
        return null;
    }

    // A failed poll keeps the data already read, so only a read that never succeeded is reported.
    if (
        (safeInfo == null && isSafeInfoError) ||
        (transaction == null && isTransactionError)
    ) {
        return (
            <Card className="flex w-full flex-col border border-neutral-100 p-4 shadow-neutral-sm md:p-6">
                <AlertInline
                    message={t(`${translationKey}.loadError`)}
                    variant="critical"
                />
            </Card>
        );
    }

    const isLoading = safeInfo == null || transaction == null;
    const owners = safeInfo?.owners ?? [];

    // The same confirmations the readiness counts, so the progress, the voters and the actions always agree.
    const signers =
        transaction == null
            ? []
            : safeTransactionUtils
                  .getCurrentOwnerConfirmations({ transaction, owners })
                  .map(({ owner }) => owner);

    const readiness =
        safeInfo == null || transaction == null
            ? undefined
            : safeTransactionUtils.getApprovalReadiness({
                  currentNonce: safeInfo.nonce,
                  owners: safeInfo.owners,
                  threshold: safeInfo.threshold,
                  transaction,
              });

    const isConnected = connectedAddress != null;
    const isOwner = owners.some((owner) =>
        addressUtils.isAddressEqual(owner, connectedAddress),
    );
    const hasConfirmed = signers.some((signer) =>
        addressUtils.isAddressEqual(signer, connectedAddress),
    );

    // A disconnected viewer is offered the action and asked to connect first; a connected wallet that is not an owner
    // has nothing to sign or execute.
    const canAct = !isConnected || isOwner;

    const openTransactionDialog = () => {
        const params: ISafeTransactionDialogParams = {
            network,
            safeAddress,
            safeTxHash,
            onSafeStateChange,
        };

        checkWalletConnection({
            onSuccess: () => open(SafeDialogId.TRANSACTION, { params }),
        });
    };

    const settings =
        safeInfo == null
            ? []
            : safeMultisigSettingsUtils.parseSettings({
                  address: safeAddress,
                  safeName: addressUtils.truncateAddress(safeAddress),
                  safeHref: buildEntityUrl({
                      type: ChainEntityType.ADDRESS,
                      id: safeAddress,
                  }),
                  version: safeInfo.version,
                  safeInfo,
                  t,
              });

    const renderActions = () => {
        if (readiness === SafeApprovalReadiness.AWAITING_APPROVALS) {
            if (hasConfirmed) {
                return (
                    <Button
                        className="w-full md:w-fit"
                        disabled={true}
                        iconLeft={IconType.CHECKMARK}
                        size="md"
                        variant="secondary"
                    >
                        {t(`${translationKey}.approved`)}
                    </Button>
                );
            }

            return canAct ? (
                <Button
                    className="w-full md:w-fit"
                    onClick={openTransactionDialog}
                    size="md"
                    variant="primary"
                >
                    {t(`${translationKey}.approve`)}
                </Button>
            ) : null;
        }

        if (
            readiness === SafeApprovalReadiness.READY_TO_EXECUTE ||
            readiness === SafeApprovalReadiness.WAITING_FOR_NONCE
        ) {
            return canAct ? (
                <Button
                    className="w-full md:w-fit"
                    disabled={
                        readiness === SafeApprovalReadiness.WAITING_FOR_NONCE
                    }
                    onClick={openTransactionDialog}
                    size="md"
                    variant="primary"
                >
                    {t(`${translationKey}.execute`)}
                </Button>
            ) : null;
        }

        if (readiness === SafeApprovalReadiness.SUPERSEDED) {
            return (
                <AlertInline
                    message={t(`${translationKey}.superseded`)}
                    variant="warning"
                />
            );
        }

        return null;
    };

    const actions = renderActions();

    return (
        <Card className="flex w-full flex-col border border-neutral-100 p-4 shadow-neutral-sm md:p-6">
            <Tabs.Root
                className="flex w-full flex-col gap-4 md:gap-6"
                defaultValue={ProposalVotingTab.BREAKDOWN}
            >
                <Tabs.List>
                    {Object.values(ProposalVotingTab).map((tab) => (
                        <Tabs.Trigger
                            key={tab}
                            label={copy.proposalVotingTabs[tab]}
                            value={tab}
                        />
                    ))}
                </Tabs.List>
                <SafeMultisigProposalVotingBreakdownView
                    approvalsAmount={signers.length}
                    membersCount={isLoading ? undefined : owners.length}
                    minApprovals={safeInfo?.threshold ?? 0}
                >
                    {readiness === SafeApprovalReadiness.WAITING_FOR_NONCE &&
                        safeInfo != null &&
                        transaction != null && (
                            <div className="pt-6">
                                <AlertCard
                                    message={t(
                                        `${translationKey}.waitingForNonce.title`,
                                        { currentNonce: safeInfo.nonce },
                                    )}
                                    variant="warning"
                                >
                                    <p>
                                        {t(
                                            `${translationKey}.waitingForNonce.description`,
                                            { nonce: transaction.nonce },
                                        )}
                                    </p>
                                </AlertCard>
                            </div>
                        )}
                    {actions != null && (
                        <div className="flex flex-col items-start gap-3 pt-6 md:flex-row md:items-center">
                            {actions}
                        </div>
                    )}
                </SafeMultisigProposalVotingBreakdownView>
                <ProposalVoting.Votes>
                    <SafeMultisigVoteListView
                        connectedAddress={connectedAddress}
                        isLoading={isLoading}
                        signers={signers}
                    />
                </ProposalVoting.Votes>
                <ProposalVoting.Details settings={settings} />
            </Tabs.Root>
        </Card>
    );
};
