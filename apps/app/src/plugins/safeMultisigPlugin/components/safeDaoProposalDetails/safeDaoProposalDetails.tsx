'use client';

import {
    AlertInline,
    addressUtils,
    Button,
    CardEmptyState,
    DataListContainer,
    DataListPagination,
    DataListRoot,
    type IDefinitionSetting,
    ProposalActions,
    ProposalStatus,
    ProposalVoting,
    VoteDataListItem,
} from '@aragon/gov-ui-kit';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { ProposalActionsItem } from '@/modules/governance/components/proposalActionsItem';
import { proposalActionUtils } from '@/modules/governance/utils/proposalActionUtils';
import { SafeOwnerList } from '@/modules/safe/components/safeOwnerList';
import { SafeTransactionReviewContent } from '@/modules/safe/components/safeTransactionReviewContent';
import { SafeDialogId } from '@/modules/safe/constants/safeDialogId';
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
import { safeMultisigProposalUtils } from '../../utils/safeMultisigProposalUtils';

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
    const safePlugin =
        safeAddress != null
            ? safePluginCandidates.find((plugin) =>
                  addressUtils.isAddressEqual(plugin.address, safeAddress),
              )
            : safePluginCandidates.length === 1
              ? safePluginCandidates[0]
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
        return (
            <SafeDaoProposalDetailsState
                description={t(
                    'app.safe.safeDaoProposalDetails.loadingDescription',
                )}
                heading={t('app.safe.safeDaoProposalDetails.loadingHeading')}
                illustration="ACTION"
            />
        );
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
        return (
            <SafeDaoProposalDetailsState
                description={t(
                    'app.safe.safeDaoProposalDetails.loadingDescription',
                )}
                heading={t('app.safe.safeDaoProposalDetails.loadingHeading')}
                illustration="ACTION"
            />
        );
    }

    if (proposals.isIndexing && (proposal == null || proposals.data == null)) {
        return (
            <SafeDaoProposalDetailsState
                description={t(
                    'app.safe.safeDaoProposalDetails.loadingDescription',
                )}
                heading={t('app.safe.safeDaoProposalDetails.loadingHeading')}
                illustration="ACTION"
            />
        );
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
    const { open } = useDialogContext();
    const { transaction, actions: localActions, status } = proposal;
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
    const statusKey = getSafeDaoProposalStatusKey({
        isExecuted: transaction.isExecuted,
        isSuccessful: transaction.isSuccessful,
        status,
    });
    const details: IDefinitionSetting[] = [
        {
            term: t('app.safe.safeDaoProposalDetails.status'),
            definition: t(`app.safe.safeDaoProposalDetails.${statusKey}`),
        },
        {
            copyValue: plugin.address,
            term: t('app.safe.safeDaoProposalDetails.safeAddress'),
            definition: addressUtils.truncateAddress(plugin.address),
        },
        {
            copyValue: transaction.safeTxHash,
            term: t('app.safe.safeDaoProposalDetails.safeTransactionHash'),
            definition: addressUtils.truncateAddress(transaction.safeTxHash),
        },
        {
            term: t('app.safe.safeDaoProposalDetails.nonce'),
            definition: transaction.nonce,
        },
        {
            term: t('app.safe.safeDaoProposalDetails.confirmations'),
            definition: t('app.safe.safeDaoProposalDetails.confirmationCount', {
                approved: approvalCount,
                required: safeInfo.threshold,
            }),
        },
        {
            copyValue: targetDaoAddress,
            term: t('app.safe.safeDaoProposalDetails.targetDao'),
            definition: addressUtils.truncateAddress(targetDaoAddress),
        },
    ];
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
    const canSign = !transaction.isExecuted && status === ProposalStatus.ACTIVE;

    return (
        <>
            <Page.Header
                breadcrumbs={[
                    {
                        href: proposalsUrl,
                        label: t('app.governance.daoProposalsPage.main.title'),
                    },
                ]}
                title={t('app.safe.safeDaoProposalDetails.title', {
                    nonce: transaction.nonce,
                })}
            />
            <Page.Content>
                <Page.Main>
                    <Page.MainSection
                        title={t(
                            'app.safe.safeDaoProposalDetails.actionsTitle',
                        )}
                    >
                        <SafeTransactionReviewContent
                            network={dao.network}
                            safeAddress={plugin.address}
                            safeVersion={safeInfo.version}
                            transaction={transaction}
                        />
                        <SafeDaoProposalActions
                            actions={actions}
                            dao={dao}
                            daoId={daoId}
                        />
                    </Page.MainSection>
                    <Page.MainSection
                        title={t('app.safe.safeDaoProposalDetails.votingTitle')}
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
                            <ProposalVoting.Container status={status}>
                                <ProposalVoting.BodyContent
                                    name={addressUtils.truncateAddress(
                                        plugin.address,
                                    )}
                                    status={status}
                                >
                                    <ProposalVoting.BreakdownMultisig
                                        approvalsAmount={approvalCount}
                                        membersCount={safeInfo.owners.length}
                                        minApprovals={safeInfo.threshold}
                                    >
                                        {transaction.isExecuted ? (
                                            <AlertInline
                                                className="mt-6"
                                                message={t(
                                                    `app.safe.safeDaoProposalDetails.${statusKey}`,
                                                )}
                                                variant={
                                                    transaction.isSuccessful ===
                                                    true
                                                        ? 'success'
                                                        : transaction.isSuccessful ===
                                                            false
                                                          ? 'critical'
                                                          : 'warning'
                                                }
                                            />
                                        ) : canSign ? (
                                            <Button
                                                className="mt-6"
                                                onClick={handleSign}
                                            >
                                                {t(
                                                    'app.safe.safeDaoProposalDetails.sign',
                                                )}
                                            </Button>
                                        ) : (
                                            <AlertInline
                                                className="mt-6"
                                                message={t(
                                                    `app.safe.safeDaoProposalDetails.${statusKey}`,
                                                )}
                                                variant="warning"
                                            />
                                        )}
                                    </ProposalVoting.BreakdownMultisig>
                                    <ProposalVoting.Votes>
                                        <SafeDaoProposalConfirmations
                                            confirmations={confirmedOwners}
                                        />
                                    </ProposalVoting.Votes>
                                    <ProposalVoting.Details
                                        settings={details}
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
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard
                        title={t('app.safe.safeDaoProposalDetails.ownersTitle')}
                    >
                        <SafeOwnerList
                            address={plugin.address}
                            network={dao.network}
                        />
                    </Page.AsideCard>
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
    const { t } = useTranslations();
    const { chainId } = useDaoChain({ network: dao.network });
    const normalizedActions = proposalActionUtils.normalizeActions(
        actions,
        dao,
    );

    if (normalizedActions.length === 0) {
        return (
            <CardEmptyState
                className="mt-4"
                description={t(
                    'app.safe.safeDaoProposalDetails.noActionsDescription',
                )}
                heading={t('app.safe.safeDaoProposalDetails.noActionsHeading')}
                objectIllustration={{ object: 'ACTION' }}
            />
        );
    }

    return (
        <ProposalActions.Root actionsCount={normalizedActions.length}>
            <ProposalActions.Container emptyStateDescription="">
                {normalizedActions.map((action, index) => (
                    <ProposalActionsItem
                        action={action}
                        chainId={chainId}
                        daoId={daoId}
                        key={`${action.to}-${index}`}
                    />
                ))}
            </ProposalActions.Container>
        </ProposalActions.Root>
    );
};

interface ISafeDaoProposalConfirmationsProps {
    confirmations: string[];
}

const SafeDaoProposalConfirmations: React.FC<
    ISafeDaoProposalConfirmationsProps
> = ({ confirmations }) => {
    const { t } = useTranslations();

    return (
        <DataListRoot
            entityLabel={t(
                'app.safe.safeDaoProposalDetails.confirmationsEntity',
            )}
            itemsCount={confirmations.length}
            pageSize={6}
            state="idle"
        >
            <DataListContainer
                emptyState={{
                    description: t(
                        'app.safe.safeDaoProposalDetails.confirmationsEmptyDescription',
                    ),
                    heading: t(
                        'app.safe.safeDaoProposalDetails.confirmationsEmptyHeading',
                    ),
                    objectIllustration: { object: 'USERS' },
                }}
                SkeletonElement={VoteDataListItem.Skeleton}
            >
                {confirmations.map((owner) => (
                    <VoteDataListItem.Structure
                        key={owner}
                        voteIndicator="approve"
                        voter={{ address: owner }}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
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

const getSafeDaoProposalStatusKey = ({
    isExecuted,
    isSuccessful,
    status,
}: {
    isExecuted: boolean;
    isSuccessful: boolean | null;
    status: ProposalStatus;
}): string => {
    if (isExecuted) {
        if (isSuccessful === true) {
            return 'executedSuccess';
        }
        if (isSuccessful === false) {
            return 'executedFailure';
        }
        return 'executedUnknown';
    }

    return status === ProposalStatus.EXPIRED ? 'superseded' : 'ready';
};
