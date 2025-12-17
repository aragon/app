'use client';

import {
    ActionSimulation,
    addressUtils,
    CardCollapsible,
    ChainEntityType,
    DateFormat,
    DefinitionList,
    formatterUtils,
    type IProposalActionsFooterDropdownItem,
    Link,
    ProposalActions,
    ProposalStatus,
    proposalStatusToTagVariant,
    Tag,
    useGukModulesContext,
} from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { ProposalExecutionStatus } from '@/modules/governance/components/proposalExecutionStatus';
import { proposalActionsImportExportUtils } from '@/modules/governance/utils/proposalActionsImportExportUtils';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { type IDao, useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { SafeDocumentParser } from '@/shared/components/SafeDocumentParser';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { daoUtils } from '@/shared/utils/daoUtils';
import { actionSimulationServiceKeys, useLastSimulation, useSimulateProposal } from '../../api/actionSimulationService';
import { governanceServiceKeys, type IProposal, useProposalActions, useProposalBySlug } from '../../api/governanceService';
import type { IProposalActionData } from '../../components/createProposalForm';
import { ProposalVotingTerminal } from '../../components/proposalVotingTerminal';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { proposalActionUtils } from '../../utils/proposalActionUtils';

export interface IDaoProposalDetailsPageClientProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * The slug of the proposal.
     */
    proposalSlug: string;
}

// Proposal actions cannot be simulated if last simulation has been triggered less than 10 minutes ago
const actionSimulationLimitMillis = 10 * 60 * 1000;

interface IProposalActionsSectionProps {
    actionsCount: number;
    actionData: ReturnType<typeof useProposalActions>['data'];
    normalizedProposalActions: ReturnType<typeof proposalActionUtils.normalizeActions>;
    daoId: string;
    proposal: IProposal;
    chainId?: number;
    showActionSimulation: boolean;
    showSimulationError: boolean;
    simulationError: string;
    isSimulationLoading: boolean;
    canSimulate: boolean;
    processedLastSimulation: ReturnType<typeof useLastSimulation>['data'] | undefined;
    onSimulate: () => void;
    dropdownItems: IProposalActionsFooterDropdownItem[] | undefined;
    t: ReturnType<typeof useTranslations>['t'];
}

const useProposalActionsSectionData = (params: {
    proposal: IProposal | undefined;
    dao: IDao | undefined;
    proposalSlug: string;
    queryClient: ReturnType<typeof useQueryClient>;
    t: ReturnType<typeof useTranslations>['t'];
}) => {
    const { proposal, dao, proposalSlug, queryClient, t } = params;
    const proposalId = proposal?.id;

    const { data: actionData } = useProposalActions(
        { urlParams: { id: proposalId as string } },
        {
            enabled: proposal != null,
            refetchInterval: ({ state }) => (state.data?.decoding ? 2000 : false),
        }
    );
    const actionsCount = actionData?.rawActions?.length ?? 0;

    const { networkDefinition } = useDaoChain({
        network: proposal?.network,
    });
    const { tenderlySupport } = networkDefinition ?? {};

    const proposalStatus = useSlotSingleFunction<IProposal, ProposalStatus>({
        params: proposal,
        slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
        pluginId: proposal?.pluginInterfaceType ?? '',
    })!;

    const isSimulationSupportedByStatus = [
        ProposalStatus.ACTIVE,
        ProposalStatus.ADVANCEABLE,
        ProposalStatus.PENDING,
        ProposalStatus.EXECUTABLE,
    ].includes(proposalStatus);

    const showActionSimulation = Boolean(proposal?.hasActions && tenderlySupport && isSimulationSupportedByStatus);

    const {
        data: lastSimulation,
        isError: isLastSimulationError,
        error: lastSimulationError,
    } = useLastSimulation({ urlParams: { proposalId: proposalId as string } }, { enabled: !!proposal?.hasSimulation });

    const { mutate: simulateProposal, isPending: isSimulationLoading, isError: hasSimulationFailed } = useSimulateProposal();

    const handleSimulateProposalSuccess = () => {
        if (!(proposalId && dao?.id)) {
            return;
        }
        const urlParams = { proposalId };
        const simulationQueryKey = actionSimulationServiceKeys.lastSimulation({
            urlParams,
        });
        const proposalQueryKey = governanceServiceKeys.proposalBySlug({
            urlParams: { slug: proposalSlug },
            queryParams: { daoId: dao.id },
        });
        void queryClient.invalidateQueries({ queryKey: simulationQueryKey });
        void queryClient.invalidateQueries({ queryKey: proposalQueryKey });
    };

    const handleSimulateProposal = () => {
        if (!proposalId) {
            return;
        }
        const urlParams = { proposalId };
        simulateProposal({ urlParams }, { onSuccess: handleSimulateProposalSuccess });
    };

    const isLastSimulationNotFoundError = AragonBackendServiceError.isNotFoundError(lastSimulationError);
    const showSimulationError = hasSimulationFailed || (isLastSimulationError && !isLastSimulationNotFoundError);

    const canSimulate = lastSimulation == null || Date.now() - lastSimulation.runAt > actionSimulationLimitMillis;
    const processedLastSimulation = lastSimulation ? { ...lastSimulation, timestamp: lastSimulation.runAt } : undefined;
    const simulationErrorContext = hasSimulationFailed ? 'simulationError' : 'lastSimulationError';
    const simulationError = t(`app.governance.daoProposalDetailsPage.main.actions.${simulationErrorContext}`);

    const normalizedProposalActions = proposalActionUtils.normalizeActions(actionData?.actions ?? [], dao);
    const proposalActionsDropdownItems: IProposalActionsFooterDropdownItem[] = [
        {
            label: t('app.governance.daoProposalDetailsPage.main.actions.downloadAsJSON'),
            onClick: () =>
                proposalActionsImportExportUtils.downloadActionsAsJSON(actionData?.actions ?? [], `proposal-${proposalSlug}-actions.json`),
        },
    ];

    return {
        actionData,
        actionsCount,
        canSimulate,
        showActionSimulation,
        showSimulationError,
        simulationError,
        isSimulationLoading,
        processedLastSimulation,
        handleSimulateProposal,
        normalizedProposalActions,
        proposalActionsDropdownItems,
        proposalStatus,
    };
};

const ProposalActionsSection: React.FC<IProposalActionsSectionProps> = (props) => {
    const {
        actionsCount,
        actionData,
        normalizedProposalActions,
        daoId,
        proposal,
        chainId,
        showActionSimulation,
        showSimulationError,
        simulationError,
        isSimulationLoading,
        canSimulate,
        processedLastSimulation,
        onSimulate,
        dropdownItems,
        t,
    } = props;

    return (
        <Page.MainSection title={t('app.governance.daoProposalDetailsPage.main.actions.header')}>
            {showActionSimulation && (
                <ActionSimulation
                    error={showSimulationError ? simulationError : undefined}
                    isEnabled={canSimulate}
                    isLoading={isSimulationLoading}
                    lastSimulation={processedLastSimulation}
                    onSimulate={onSimulate}
                    totalActions={actionsCount}
                />
            )}
            <ProposalActions.Root actionsCount={actionsCount} isLoading={actionData?.decoding}>
                <ProposalActions.Container emptyStateDescription="">
                    {normalizedProposalActions.map((action, index) => {
                        const fnSelector = proposalActionUtils.actionToFunctionSelector(action);
                        const customActionView = actionViewRegistry.getViewBySelector(fnSelector);
                        const actionKey = `${fnSelector}-${action.to ?? index}`;

                        return customActionView ? (
                            <ProposalActions.Item<IProposalActionData>
                                action={
                                    {
                                        ...action,
                                        daoId,
                                    } as IProposalActionData
                                }
                                actionFunctionSelector={fnSelector}
                                CustomComponent={customActionView.componentDetails}
                                chainId={chainId}
                                key={actionKey}
                                readOnly={true}
                            />
                        ) : (
                            <ProposalActions.Item
                                action={action}
                                actionFunctionSelector={fnSelector}
                                chainId={chainId}
                                key={actionKey}
                                readOnly={true}
                            />
                        );
                    })}
                </ProposalActions.Container>
                <ProposalActions.Footer dropdownItems={dropdownItems}>
                    {normalizedProposalActions.length > 0 && <ProposalExecutionStatus daoId={daoId} proposal={proposal} />}
                </ProposalActions.Footer>
            </ProposalActions.Root>
        </Page.MainSection>
    );
};

export const DaoProposalDetailsPageClient: React.FC<IDaoProposalDetailsPageClientProps> = (props) => {
    const { daoId, proposalSlug } = props;

    const { t } = useTranslations();
    const { copy } = useGukModulesContext();
    const queryClient = useQueryClient();

    const proposalUrlParams = { slug: proposalSlug };
    const proposalParams = {
        urlParams: proposalUrlParams,
        queryParams: { daoId },
    };
    const { data: proposal } = useProposalBySlug(proposalParams);

    const daoParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoParams });

    const { buildEntityUrl, chainId } = useDaoChain({
        network: proposal?.network,
    });
    const {
        actionData,
        actionsCount,
        canSimulate,
        showActionSimulation,
        showSimulationError,
        simulationError,
        isSimulationLoading,
        processedLastSimulation,
        handleSimulateProposal,
        normalizedProposalActions,
        proposalActionsDropdownItems,
        proposalStatus,
    } = useProposalActionsSectionData({ proposal, dao, proposalSlug, queryClient, t });

    if (proposal == null || dao == null) {
        return null;
    }

    const { blockTimestamp, creator, transactionHash, summary, title, description, resources } = proposal;

    const formattedCreationDate = formatterUtils.formatDate(blockTimestamp * 1000, {
        format: DateFormat.YEAR_MONTH_DAY,
    });

    const creatorName = creator.ens ?? addressUtils.truncateAddress(creator.address);

    const creatorLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: creator.address,
    });
    const creationBlockLink = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: transactionHash,
    });

    const statusTag = {
        label: copy.proposalDataListItemStatus.statusLabel[proposalStatus],
        variant: proposalStatusToTagVariant[proposalStatus],
    };

    const proposalsUrl = daoUtils.getDaoUrl(dao, 'proposals');
    const pageBreadcrumbs = [
        {
            href: proposalsUrl,
            label: t('app.governance.daoProposalDetailsPage.header.breadcrumb.proposals'),
        },
        { label: proposalSlug.toUpperCase() },
    ];

    return (
        <>
            <Page.Header breadcrumbs={pageBreadcrumbs} breadcrumbsTag={statusTag} description={summary} title={title} />
            <Page.Content>
                <Page.Main>
                    {description && (
                        <Page.MainSection title={t('app.governance.daoProposalDetailsPage.main.description.header')}>
                            <CardCollapsible
                                buttonLabelClosed={t('app.governance.daoProposalDetailsPage.main.description.readMore')}
                                buttonLabelOpened={t('app.governance.daoProposalDetailsPage.main.description.readLess')}
                            >
                                <SafeDocumentParser document={description} immediatelyRender={false} />
                            </CardCollapsible>
                        </Page.MainSection>
                    )}
                    <Page.MainSection title={t('app.governance.daoProposalDetailsPage.main.voting')}>
                        <PluginSingleComponent
                            daoId={daoId}
                            Fallback={ProposalVotingTerminal}
                            pluginId={proposal.pluginInterfaceType}
                            proposal={proposal}
                            slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_TERMINAL}
                            status={proposalStatus}
                        />
                    </Page.MainSection>
                    <ProposalActionsSection
                        actionData={actionData}
                        actionsCount={actionsCount}
                        canSimulate={canSimulate}
                        chainId={chainId}
                        daoId={daoId}
                        dropdownItems={normalizedProposalActions.length > 0 ? proposalActionsDropdownItems : undefined}
                        isSimulationLoading={isSimulationLoading}
                        normalizedProposalActions={normalizedProposalActions}
                        onSimulate={handleSimulateProposal}
                        processedLastSimulation={processedLastSimulation}
                        proposal={proposal}
                        showActionSimulation={showActionSimulation}
                        showSimulationError={showSimulationError}
                        simulationError={simulationError}
                        t={t}
                    />
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard
                        data-testid="proposal-details-container"
                        title={t('app.governance.daoProposalDetailsPage.aside.details.title')}
                    >
                        <DefinitionList.Container>
                            <DefinitionList.Item
                                copyValue={proposal.proposalIndex}
                                term={t('app.governance.daoProposalDetailsPage.aside.details.onChainId')}
                            >
                                <p className="truncate text-neutral-500">{proposal.proposalIndex}</p>
                            </DefinitionList.Item>
                            <DefinitionList.Item term={t('app.governance.daoProposalDetailsPage.aside.details.id')}>
                                <p className="truncate text-neutral-500">{proposalSlug.toUpperCase()}</p>
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                copyValue={creator.ens ?? creator.address}
                                link={{ href: creatorLink }}
                                term={t('app.governance.daoProposalDetailsPage.aside.details.creator')}
                            >
                                {creatorName}
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                link={{
                                    href: creationBlockLink,
                                    textClassName: 'first-letter:capitalize',
                                }}
                                term={t('app.governance.daoProposalDetailsPage.aside.details.published')}
                            >
                                {formattedCreationDate}
                            </DefinitionList.Item>
                            <DefinitionList.Item term={t('app.governance.daoProposalDetailsPage.aside.details.status')}>
                                <Tag className="w-fit" label={statusTag.label} variant={statusTag.variant} />
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                    </Page.AsideCard>
                    {resources.length > 0 && (
                        <Page.AsideCard title={t('app.governance.daoProposalDetailsPage.aside.links.title')}>
                            <div className="flex flex-col gap-4">
                                {resources.map((resource) => (
                                    <Link href={resource.url} isExternal={true} key={resource.name} showUrl={true}>
                                        {resource.name}
                                    </Link>
                                ))}
                            </div>
                        </Page.AsideCard>
                    )}
                </Page.Aside>
            </Page.Content>
        </>
    );
};
