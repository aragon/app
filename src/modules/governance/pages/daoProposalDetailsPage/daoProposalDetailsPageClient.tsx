'use client';

import { ProposalExecutionStatus } from '@/modules/governance/components/proposalExecutionStatus';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    ActionSimulation,
    addressUtils,
    CardCollapsible,
    ChainEntityType,
    DateFormat,
    DefinitionList,
    DocumentParser,
    formatterUtils,
    Link,
    ProposalActions,
    ProposalStatus,
    proposalStatusToTagVariant,
    Tag,
    useBlockExplorer,
    useGukModulesContext,
} from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { actionSimulationServiceKeys, useLastSimulation, useSimulateProposal } from '../../api/actionSimulationService';
import {
    governanceServiceKeys,
    type IProposal,
    useProposalActions,
    useProposalBySlug,
} from '../../api/governanceService';
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
const actionSimulationLimitMillis = 10 * 60 * 1_000;

export const DaoProposalDetailsPageClient: React.FC<IDaoProposalDetailsPageClientProps> = (props) => {
    const { daoId, proposalSlug } = props;

    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer();
    const { copy } = useGukModulesContext();
    const queryClient = useQueryClient();

    const proposalUrlParams = { slug: proposalSlug };
    const proposalParams = { urlParams: proposalUrlParams, queryParams: { daoId } };
    const { data: proposal } = useProposalBySlug(proposalParams);

    const daoParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoParams });
    const { tenderlySupport } = dao ? networkDefinitions[dao.network] : {};

    const proposalStatus = useSlotSingleFunction<IProposal, ProposalStatus>({
        params: proposal!,
        slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
        pluginId: proposal?.pluginInterfaceType ?? '',
    })!;

    const { data: actionData } = useProposalActions(
        { urlParams: { id: proposal?.id as string } },
        { enabled: proposal != null, refetchInterval: ({ state }) => (state.data?.decoding ? 2000 : false) },
    );
    const actionsCount = actionData?.rawActions?.length ?? 0;

    const showActionSimulation = proposal?.hasActions && tenderlySupport;

    const {
        data: lastSimulation,
        isError: isLastSimulationError,
        error: lastSimulationError,
    } = useLastSimulation({ urlParams: { proposalId: proposal?.id as string } }, { enabled: proposal?.hasSimulation });

    const {
        mutate: simulateProposal,
        isPending: isSimulationLoading,
        isError: hasSimulationFailed,
    } = useSimulateProposal();

    if (proposal == null || dao == null) {
        return null;
    }

    const isLastSimulationNotFoundError = AragonBackendServiceError.isNotFoundError(lastSimulationError);
    const showSimulationError = hasSimulationFailed || (isLastSimulationError && !isLastSimulationNotFoundError);

    const handleSimulateProposalSuccess = () => {
        const urlParams = { proposalId: proposal.id };
        const simulationQueryKey = actionSimulationServiceKeys.lastSimulation({ urlParams });
        const proposalQueryKey = governanceServiceKeys.proposalBySlug(proposalParams);
        void queryClient.invalidateQueries({ queryKey: simulationQueryKey });
        void queryClient.invalidateQueries({ queryKey: proposalQueryKey });
    };

    const handleSimulateProposal = () => {
        const urlParams = { proposalId: proposal.id };
        simulateProposal({ urlParams }, { onSuccess: handleSimulateProposalSuccess });
    };

    const { blockTimestamp, creator, transactionHash, summary, title, description, resources } = proposal;

    const normalizedProposalActions = proposalActionUtils.normalizeActions(actionData?.actions ?? [], dao);
    const formattedCreationDate = formatterUtils.formatDate(blockTimestamp * 1000, {
        format: DateFormat.YEAR_MONTH_DAY,
    });

    const creatorName = creator.ens ?? addressUtils.truncateAddress(creator.address);

    const { id: chainId } = networkDefinitions[proposal.network];
    const creatorLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: creator.address, chainId });
    const creationBlockLink = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: transactionHash, chainId });

    const statusTag = {
        label: copy.proposalDataListItemStatus.statusLabel[proposalStatus],
        variant: proposalStatusToTagVariant[proposalStatus],
    };

    const proposalsUrl = daoUtils.getDaoUrl(dao, 'proposals');
    const pageBreadcrumbs = [
        { href: proposalsUrl, label: t('app.governance.daoProposalDetailsPage.header.breadcrumb.proposals') },
        { label: proposalSlug.toUpperCase() },
    ];

    const canSimulate =
        [ProposalStatus.ACTIVE, ProposalStatus.ADVANCEABLE, ProposalStatus.PENDING, ProposalStatus.EXECUTABLE].includes(
            proposalStatus,
        ) &&
        (lastSimulation == null || Date.now() - lastSimulation.runAt > actionSimulationLimitMillis);

    const processedLastSimulation = lastSimulation ? { ...lastSimulation, timestamp: lastSimulation.runAt } : undefined;
    const simulationErrorContext = hasSimulationFailed ? 'simulationError' : 'lastSimulationError';
    const simulationError = t(`app.governance.daoProposalDetailsPage.main.actions.${simulationErrorContext}`);

    return (
        <>
            <Page.Header breadcrumbs={pageBreadcrumbs} breadcrumbsTag={statusTag} title={title} description={summary} />
            <Page.Content>
                <Page.Main>
                    {description && (
                        <Page.MainSection title={t('app.governance.daoProposalDetailsPage.main.description.header')}>
                            <CardCollapsible
                                buttonLabelClosed={t('app.governance.daoProposalDetailsPage.main.description.readMore')}
                                buttonLabelOpened={t('app.governance.daoProposalDetailsPage.main.description.readLess')}
                            >
                                <DocumentParser document={description} immediatelyRender={false} />
                            </CardCollapsible>
                        </Page.MainSection>
                    )}
                    <Page.MainSection title={t('app.governance.daoProposalDetailsPage.main.voting')}>
                        <PluginSingleComponent
                            slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_TERMINAL}
                            pluginId={proposal.pluginInterfaceType}
                            proposal={proposal}
                            status={proposalStatus}
                            daoId={daoId}
                            Fallback={ProposalVotingTerminal}
                        />
                    </Page.MainSection>
                    <Page.MainSection title={t('app.governance.daoProposalDetailsPage.main.actions.header')}>
                        {showActionSimulation && (
                            <ActionSimulation
                                totalActions={actionsCount}
                                lastSimulation={processedLastSimulation}
                                isLoading={isSimulationLoading}
                                error={showSimulationError ? simulationError : undefined}
                                onSimulate={handleSimulateProposal}
                                isEnabled={canSimulate}
                            />
                        )}
                        <ProposalActions.Root isLoading={actionData?.decoding} actionsCount={actionsCount}>
                            <ProposalActions.Container emptyStateDescription="">
                                {normalizedProposalActions.map((action, index) => (
                                    <ProposalActions.Item
                                        key={index}
                                        action={action}
                                        actionFunctionSelector={proposalActionUtils.actionToFunctionSelector(action)}
                                        chainId={chainId}
                                    />
                                ))}
                            </ProposalActions.Container>
                            <ProposalActions.Footer>
                                {normalizedProposalActions.length > 0 && (
                                    <ProposalExecutionStatus daoId={daoId} proposal={proposal} />
                                )}
                            </ProposalActions.Footer>
                        </ProposalActions.Root>
                    </Page.MainSection>
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard
                        data-testid="proposal-details-container"
                        title={t('app.governance.daoProposalDetailsPage.aside.details.title')}
                    >
                        <DefinitionList.Container>
                            <DefinitionList.Item
                                term={t('app.governance.daoProposalDetailsPage.aside.details.onChainId')}
                                copyValue={proposal.proposalIndex}
                            >
                                <p className="truncate text-neutral-500">{proposal.proposalIndex}</p>
                            </DefinitionList.Item>
                            <DefinitionList.Item term={t('app.governance.daoProposalDetailsPage.aside.details.id')}>
                                <p className="truncate text-neutral-500">{proposalSlug.toUpperCase()}</p>
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                term={t('app.governance.daoProposalDetailsPage.aside.details.creator')}
                                copyValue={creator.ens ?? creator.address}
                                link={{ href: creatorLink }}
                            >
                                {creatorName}
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                term={t('app.governance.daoProposalDetailsPage.aside.details.published')}
                                link={{ href: creationBlockLink, textClassName: 'first-letter:capitalize' }}
                            >
                                {formattedCreationDate}
                            </DefinitionList.Item>
                            <DefinitionList.Item term={t('app.governance.daoProposalDetailsPage.aside.details.status')}>
                                <Tag label={statusTag.label} variant={statusTag.variant} className="w-fit" />
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                    </Page.AsideCard>
                    {resources.length > 0 && (
                        <Page.AsideCard title={t('app.governance.daoProposalDetailsPage.aside.links.title')}>
                            <div className="flex flex-col gap-4">
                                {resources.map((resource) => (
                                    <Link key={resource.name} href={resource.url} isExternal={true} showUrl={true}>
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
