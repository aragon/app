'use client';

import {
    AlertInline,
    addressUtils,
    Button,
    CardEmptyState,
    ChainEntityType,
    DateFormat,
    DefinitionList,
    formatterUtils,
    IconType,
    ProposalActions,
    ProposalVoting,
    proposalStatusToTagVariant,
    useGukModulesContext,
} from '@aragon/gov-ui-kit';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { safeAppAccountUrl } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import { useEnsName } from '@/modules/ens';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { ProposalActionsItem } from '@/modules/governance/components/proposalActionsItem';
import { ProposalDetailsAside } from '@/modules/governance/components/proposalDetailsAside';
import { proposalActionUtils } from '@/modules/governance/utils/proposalActionUtils';
import { SafeDialogId } from '@/modules/safe/constants/safeDialogId';
import { brandedExternals } from '@/plugins/sppPlugin/constants/sppPluginBrandedExternals';
import { VotingBodyBrandIdentity } from '@/plugins/sppPlugin/types';
import {
    type IDao,
    type IDaoPlugin,
    Network,
    PluginInterfaceType,
    useDao,
} from '@/shared/api/daoService';
import type {
    ISafeConfirmation,
    ISafeInfoResponse,
} from '@/shared/api/safeService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useSafeDaoProposalActions } from '../../hooks/useSafeDaoProposalActions';
import type { ISafeDaoProposal } from '../../hooks/useSafeDaoProposals';
import { useSafeDaoProposal } from '../../hooks/useSafeDaoProposals';
import { safeDaoProposalUtils } from '../../utils/safeDaoProposalUtils';
import {
    SafeApprovalReadiness,
    safeMultisigProposalUtils,
} from '../../utils/safeMultisigProposalUtils';
import { safeMultisigSettingsUtils } from '../../utils/safeMultisigSettingsUtils';
import { SafeMultisigProposalVotingBreakdownView } from '../safeMultisigProposalVotingBreakdown';
import { SafeMultisigVoteListView } from '../safeMultisigVoteList';
import { SafeMultisigVotingBody } from '../safeMultisigVotingBody';

export interface ISafeDaoProposalDetailsProps {
    daoId: string;
    safeTxHash: string;
    /**
     * Safe address from the canonical list link. When omitted, a single Safe is accepted for backwards-compatible
     * links; multiple Safes require this identity component.
     */
    safeAddress?: string;
}

export const SafeDaoProposalDetails: React.FC<ISafeDaoProposalDetailsProps> = ({
    daoId,
    safeTxHash,
    safeAddress,
}) => {
    const { t } = useTranslations();
    const {
        data: dao,
        isError: isDaoError,
        isLoading: isDaoLoading,
    } = useDao({ urlParams: { id: daoId } });
    const safePlugins = useDaoPlugins({
        daoId,
        includeLinkedAccounts: true,
        interfaceType: PluginInterfaceType.SAFE,
        includeUnsupported: true,
    });
    const safePluginCandidates = safePlugins?.map(({ meta }) => meta) ?? [];
    const canonicalSafePluginCandidates = safePluginCandidates.filter(
        (plugin) => !daoUtils.isLinkedAccountPlugin(plugin, dao),
    );
    const safePlugin =
        safeAddress != null
            ? canonicalSafePluginCandidates.find((plugin) =>
                  addressUtils.isAddressEqual(plugin.address, safeAddress),
              )
            : canonicalSafePluginCandidates.length === 1
              ? canonicalSafePluginCandidates[0]
              : undefined;
    const targetDaoAddress = safePlugin?.daoAddress ?? dao?.address;
    const hasValidTargetDao =
        targetDaoAddress != null && addressUtils.isAddress(targetDaoAddress);
    const proposals = useSafeDaoProposal({
        daoAddress: targetDaoAddress ?? '',
        enabled: dao != null && safePlugin != null && hasValidTargetDao,
        network: dao?.network ?? Network.ETHEREUM_MAINNET,
        safeAddress: safePlugin?.address ?? '',
        safeTxHash,
    });
    const proposal = proposals.data?.proposals[0];

    if (isDaoLoading || (safePlugins == null && !isDaoError)) {
        return null;
    }

    if (isDaoError) {
        return (
            <SafeDaoProposalDetailsState
                description={t(
                    'app.safe.safeDaoProposalDetails.errorDescription',
                )}
                heading={t('app.safe.safeDaoProposalDetails.errorHeading')}
                illustration="ERROR"
            />
        );
    }

    if (dao == null || safePlugin == null || !hasValidTargetDao) {
        return (
            <SafeDaoProposalDetailsState
                description={t(
                    'app.safe.safeDaoProposalDetails.invalidDescription',
                )}
                heading={t('app.safe.safeDaoProposalDetails.invalidHeading')}
                illustration="ERROR"
            />
        );
    }

    if (proposals.isLoading) {
        return null;
    }

    if (proposals.isIndexing && (proposal == null || proposals.data == null)) {
        return null;
    }

    if (proposals.isError) {
        return (
            <SafeDaoProposalDetailsState
                description={t(
                    'app.safe.safeDaoProposalDetails.errorDescription',
                )}
                heading={t('app.safe.safeDaoProposalDetails.errorHeading')}
                illustration="ERROR"
            />
        );
    }

    if (proposal == null || proposals.data == null) {
        return (
            <SafeDaoProposalDetailsState
                description={t(
                    'app.safe.safeDaoProposalDetails.notFoundDescription',
                )}
                heading={t('app.safe.safeDaoProposalDetails.notFoundHeading')}
                illustration="USERS"
            />
        );
    }

    return (
        <SafeDaoProposalDetailsContent
            dao={dao}
            daoId={daoId}
            isStale={
                proposals.data.meta.stale ||
                proposals.data.meta.partial ||
                proposals.isIndexing
            }
            plugin={safePlugin}
            proposal={proposal}
            safeInfo={proposals.data.safeInfo}
        />
    );
};

interface ISafeDaoProposalDetailsStateProps {
    description: string;
    heading: string;
    illustration: 'ACTION' | 'ERROR' | 'USERS';
}

const SafeDaoProposalDetailsState: React.FC<
    ISafeDaoProposalDetailsStateProps
> = ({ description, heading, illustration }) => (
    <>
        <Page.Header title={heading} />
        <Page.Content>
            <CardEmptyState
                description={description}
                heading={heading}
                objectIllustration={{ object: illustration }}
            />
        </Page.Content>
    </>
);

interface ISafeDaoProposalDetailsContentProps {
    dao: IDao;
    daoId: string;
    isStale: boolean;
    plugin: IDaoPlugin;
    proposal: ISafeDaoProposal;
    safeInfo: ISafeInfoResponse;
}

const SafeDaoProposalDetailsContent: React.FC<
    ISafeDaoProposalDetailsContentProps
> = ({ dao, daoId, isStale, plugin, proposal, safeInfo }) => {
    const { t } = useTranslations();
    const { copy } = useGukModulesContext();
    const { open } = useDialogContext();
    const { address: connectedAddress } = useWalletAccount();
    const { data: safeEnsName } = useEnsName(plugin.address);
    const { transaction, actions: localActions } = proposal;
    const { data: proposerEnsName } = useEnsName(transaction.from ?? undefined);
    const { buildEntityUrl } = useDaoChain({ network: dao.network });
    const targetDaoAddress = plugin.daoAddress ?? dao.address;
    const proposalsUrl = daoUtils.getDaoUrl(dao, 'proposals');
    const { actions } = useSafeDaoProposalActions({
        daoAddress: targetDaoAddress,
        enabled: true,
        localActions,
        network: dao.network,
        safeAddress: plugin.address,
        safeTxHash: transaction.safeTxHash,
    });
    const confirmedOwners = getCurrentOwnerConfirmations(
        transaction.confirmations,
        safeInfo.owners,
    );
    const approvalCount = safeMultisigProposalUtils.countCurrentOwnerApprovals(
        transaction,
        safeInfo.owners,
    );
    const readiness = safeMultisigProposalUtils.getApprovalReadiness({
        currentNonce: safeInfo.nonce,
        owners: safeInfo.owners,
        threshold: safeInfo.threshold,
        transaction,
    });
    const readinessPresentation = safeApprovalReadinessPresentation[readiness];
    const readinessLabel = t(
        `app.safe.safeDaoProposalDetails.${readinessPresentation.labelKey}`,
    );
    const formattedSubmissionDate = formatterUtils.formatDate(
        transaction.submissionDate,
        { format: DateFormat.YEAR_MONTH_DAY },
    );
    const formattedExecutionDate =
        transaction.executionDate == null
            ? undefined
            : formatterUtils.formatDate(transaction.executionDate, {
                  format: DateFormat.YEAR_MONTH_DAY,
              });
    const proposalDisplayId =
        safeDaoProposalUtils.getProposalDisplayId(transaction);
    const statusTag = {
        label: copy.proposalDataListItemStatus.statusLabel[proposal.status],
        variant: proposalStatusToTagVariant[proposal.status],
    };
    const proposerLink =
        transaction.from == null
            ? undefined
            : buildEntityUrl({
                  type: ChainEntityType.ADDRESS,
                  id: transaction.from,
              });
    const executionLink =
        transaction.transactionHash == null
            ? undefined
            : buildEntityUrl({
                  type: ChainEntityType.TRANSACTION,
                  id: transaction.transactionHash,
              });

    const isConnected = connectedAddress != null;
    const isOwner =
        isConnected &&
        safeInfo.owners.some((owner) =>
            addressUtils.isAddressEqual(owner, connectedAddress),
        );
    const hasSigned = safeMultisigProposalUtils.hasAddressConfirmed({
        address: connectedAddress,
        transaction,
    });

    const handleSign = () => {
        open(SafeDialogId.NATIVE_TRANSACTION, {
            params: {
                daoAddress: targetDaoAddress,
                network: dao.network,
                safeAddress: plugin.address,
                transaction,
            },
        });
    };

    // A disconnected visitor is offered the action and the dialog gates on connection and ownership;
    // a connected non-owner has nothing to sign, and an owner who already confirmed is never asked
    // to sign the same transaction again.
    const canOfferSign = !isConnected || (isOwner && !hasSigned);

    let actionContent: React.ReactNode = null;

    if (readiness === SafeApprovalReadiness.AWAITING_APPROVALS) {
        if (isOwner && hasSigned) {
            actionContent = (
                <Button
                    className="w-fit"
                    disabled={true}
                    iconLeft={IconType.CHECKMARK}
                    variant="secondary"
                >
                    {t('app.safe.safeDaoProposalDetails.signed')}
                </Button>
            );
        } else if (canOfferSign) {
            actionContent = (
                <Button className="w-fit" onClick={handleSign}>
                    {t('app.safe.safeDaoProposalDetails.sign')}
                </Button>
            );
        }
    } else if (readiness === SafeApprovalReadiness.READY_TO_EXECUTE) {
        actionContent = (
            <Button className="w-fit" onClick={handleSign}>
                {t('app.safe.safeDaoProposalDetails.execute')}
            </Button>
        );
    } else {
        actionContent = (
            <AlertInline
                message={readinessLabel}
                variant={readinessPresentation.alertVariant ?? 'warning'}
            />
        );
    }

    const safeName =
        safeEnsName ?? addressUtils.truncateAddress(plugin.address);
    const settings = safeMultisigSettingsUtils.parseSettings({
        address: plugin.address,
        isDecided: transaction.isExecuted,
        safeHref: safeAppAccountUrl({
            address: plugin.address,
            network: dao.network,
        }),
        safeInfo,
        safeName,
        settledTransaction: transaction.isExecuted ? transaction : undefined,
        t,
        version: safeInfo.version,
    });

    return (
        <>
            <Page.Header
                breadcrumbs={[
                    {
                        href: proposalsUrl,
                        label: t(
                            'app.governance.daoProposalDetailsPage.header.breadcrumb.proposals',
                        ),
                    },
                    { label: proposalDisplayId },
                ]}
                breadcrumbsTag={statusTag}
                title={proposalDisplayId}
            />
            <Page.Content>
                <Page.Main>
                    <Page.MainSection
                        title={t(
                            'app.governance.daoProposalDetailsPage.main.voting',
                        )}
                    >
                        {isStale && (
                            <AlertInline
                                className="mb-4"
                                message={t(
                                    'app.safe.safeDaoProposalDetails.stale',
                                )}
                                variant="warning"
                            />
                        )}
                        {safeInfo.owners.length > 0 ? (
                            <ProposalVoting.Container status={proposal.status}>
                                <ProposalVoting.BodyContent
                                    bodyBrand={
                                        brandedExternals[
                                            VotingBodyBrandIdentity.SAFE
                                        ]
                                    }
                                    name={safeName}
                                    status={proposal.status}
                                >
                                    <SafeMultisigVotingBody
                                        breakdown={
                                            <SafeMultisigProposalVotingBreakdownView
                                                approvalsAmount={approvalCount}
                                                isSettled={
                                                    transaction.isExecuted
                                                }
                                                membersCount={
                                                    safeInfo.owners.length
                                                }
                                                minApprovals={
                                                    transaction.confirmationsRequired
                                                }
                                            >
                                                {actionContent != null && (
                                                    <div className="pt-6 md:pt-8">
                                                        {actionContent}
                                                    </div>
                                                )}
                                            </SafeMultisigProposalVotingBreakdownView>
                                        }
                                        settings={settings}
                                        votes={
                                            <SafeMultisigVoteListView
                                                connectedAddress={
                                                    connectedAddress
                                                }
                                                daoAddress={targetDaoAddress}
                                                network={dao.network}
                                                safeAddress={plugin.address}
                                                signers={confirmedOwners}
                                            />
                                        }
                                    />
                                </ProposalVoting.BodyContent>
                            </ProposalVoting.Container>
                        ) : (
                            <CardEmptyState
                                description={t(
                                    'app.safe.safeDaoProposalDetails.noOwnersDescription',
                                )}
                                heading={t(
                                    'app.safe.safeDaoProposalDetails.noOwnersHeading',
                                )}
                                objectIllustration={{ object: 'ERROR' }}
                            />
                        )}
                    </Page.MainSection>
                    <Page.MainSection
                        title={t(
                            'app.governance.daoProposalDetailsPage.main.actions.header',
                        )}
                    >
                        <SafeDaoProposalActions
                            actions={actions}
                            dao={dao}
                            daoId={daoId}
                        />
                    </Page.MainSection>
                </Page.Main>
                <Page.Aside>
                    <ProposalDetailsAside
                        creatorAddress={transaction.from ?? undefined}
                        creatorEnsName={proposerEnsName}
                        creatorLink={proposerLink}
                        id={proposalDisplayId}
                        idCopyValue={transaction.safeTxHash}
                        publishedDate={formattedSubmissionDate}
                        statusLabel={statusTag.label}
                        statusVariant={statusTag.variant}
                    >
                        {formattedExecutionDate != null && (
                            <DefinitionList.Item
                                link={
                                    executionLink != null
                                        ? {
                                              href: executionLink,
                                              textClassName:
                                                  'first-letter:capitalize',
                                          }
                                        : undefined
                                }
                                term={t(
                                    'app.safe.safeDaoProposalDetails.executionDate',
                                )}
                            >
                                {formattedExecutionDate}
                            </DefinitionList.Item>
                        )}
                    </ProposalDetailsAside>
                </Page.Aside>
            </Page.Content>
        </>
    );
};

interface ISafeDaoProposalActionsProps {
    actions: IProposalAction[];
    dao: IDao;
    daoId: string;
}

const SafeDaoProposalActions: React.FC<ISafeDaoProposalActionsProps> = ({
    actions,
    dao,
    daoId,
}) => {
    const { chainId } = useDaoChain({ network: dao.network });
    const normalizedActions = proposalActionUtils.normalizeActions(
        actions,
        dao,
    );

    return (
        <ProposalActions.Root actionsCount={normalizedActions.length}>
            <ProposalActions.Container emptyStateDescription="">
                {normalizedActions.map((action, index) => (
                    <ProposalActionsItem
                        action={action}
                        chainId={chainId}
                        daoId={daoId}
                        // biome-ignore lint/suspicious/noArrayIndexKey: Actions can share a target and have no stable id.
                        key={`${action.to}-${index}`}
                    />
                ))}
            </ProposalActions.Container>
            <ProposalActions.Footer />
        </ProposalActions.Root>
    );
};

const getCurrentOwnerConfirmations = (
    confirmations: ISafeConfirmation[],
    owners: string[],
): string[] => {
    const ownerSet = new Set(owners.map((owner) => owner.toLowerCase()));
    const confirmedOwnerSet = new Set<string>();
    const confirmedOwners: string[] = [];

    for (const { owner } of confirmations) {
        const normalizedOwner = owner.toLowerCase();

        if (
            ownerSet.has(normalizedOwner) &&
            !confirmedOwnerSet.has(normalizedOwner)
        ) {
            confirmedOwnerSet.add(normalizedOwner);
            confirmedOwners.push(owner);
        }
    }

    return confirmedOwners;
};
type SafeReadinessAlertVariant = 'critical' | 'success' | 'warning';

const safeApprovalReadinessPresentation: Record<
    SafeApprovalReadiness,
    {
        alertVariant?: SafeReadinessAlertVariant;
        labelKey: string;
    }
> = {
    [SafeApprovalReadiness.AWAITING_APPROVALS]: {
        labelKey: 'awaitingApprovals',
    },
    [SafeApprovalReadiness.READY_TO_EXECUTE]: {
        labelKey: 'readyToExecute',
    },
    [SafeApprovalReadiness.WAITING_FOR_NONCE]: {
        alertVariant: 'warning',
        labelKey: 'waitingForNonce',
    },
    [SafeApprovalReadiness.SUPERSEDED]: {
        alertVariant: 'warning',
        labelKey: 'superseded',
    },
    [SafeApprovalReadiness.EXECUTED_SUCCESS]: {
        alertVariant: 'success',
        labelKey: 'executedSuccess',
    },
    [SafeApprovalReadiness.EXECUTED_FAILURE]: {
        alertVariant: 'critical',
        labelKey: 'executedFailure',
    },
    [SafeApprovalReadiness.EXECUTED_UNKNOWN]: {
        alertVariant: 'warning',
        labelKey: 'executedUnknown',
    },
};
