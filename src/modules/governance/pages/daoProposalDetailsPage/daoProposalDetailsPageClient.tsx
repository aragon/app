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
import { actionViewRegistry } from '../../../../shared/utils/actionViewRegistry';
import { actionSimulationServiceKeys, useLastSimulation, useSimulateProposal } from '../../api/actionSimulationService';
import { type IProposal, useProposalActions, useProposalBySlug } from '../../api/governanceService';
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
    } = useLastSimulation({ urlParams: { proposalId: proposal?.id as string } }, { enabled: showActionSimulation });

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
        void queryClient.invalidateQueries({ queryKey: simulationQueryKey });
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

    console.log('normalizedProposalActions', normalizedProposalActions);
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
                                {normalizedProposalActions.map((action, index) => {
                                    const fnSelector = proposalActionUtils.actionToFunctionSelector(action);
                                    const customActionView = actionViewRegistry.getViewBySelector(fnSelector);
                                    // console.log('asdkjsadjsakj ', action, fnSelector);
                                    // const registerDetailsAction = {
                                    //     type: GaugeRegistrarActionType.REGISTER_GAUGE,
                                    //     inputData: {
                                    //         parameters: [
                                    //             { value: '0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3' },
                                    //             { value: 1 },
                                    //             { value: '0x78590B44F9F798212Fd7f446eE9A4183F798f218' },
                                    //         ],
                                    //     },
                                    //     gaugeMetadata: {
                                    //         name: 'Test gauge name',
                                    //         description: 'Test gauge description.',
                                    //         links: [
                                    //             { name: 'Test link 1', url: 'http://test123.com' },
                                    //             { name: 'Test link 2', url: 'https://test2.com' },
                                    //         ],
                                    //         avatar: 'ipfs://QmTsCeejcmCCWLNWKDpsVdMg9TYU3sQ6fr1KVnUsHxaPxt',
                                    //     },
                                    // };
                                    return customActionView ? (
                                        <ProposalActions.Item<IProposalActionData>
                                            key={index}
                                            action={{ ...action, daoId } as IProposalActionData}
                                            actionFunctionSelector={fnSelector}
                                            chainId={chainId}
                                            CustomComponent={customActionView.componentDetails}
                                        />
                                    ) : (
                                        <ProposalActions.Item
                                            key={index}
                                            action={action}
                                            actionFunctionSelector={fnSelector}
                                            chainId={chainId}
                                        />
                                    );
                                })}
                                {['0x46b7d62b', '0x0de61ed0'].map((selector) => {
                                    const customActionView = actionViewRegistry.getViewBySelector(selector);

                                    if (customActionView) {
                                        return (
                                            <ProposalActions.Item<IProposalActionData>
                                                key={selector}
                                                action={
                                                    {
                                                        from: '0x6361CbCB86121FB3cb4FA358AECB0E96119A7314',
                                                        to: '0x2Ac0F2cbc7C3bee636747efeF46322C4224b02d9',
                                                        data: '0x3f4ba83a',
                                                        value: '0',
                                                        type: 'Unknown',
                                                        inputData: {
                                                            function: 'Gauge Registrar Demo',
                                                            textSignature: 'unpause()',
                                                            parameters: [
                                                                { value: '0xQiTokenAddress' },
                                                                { value: 1 },
                                                                { value: '0xRewardsControllerAddress' },
                                                            ],
                                                            notice: null,
                                                            contract: 'AddressGaugeVoter',
                                                            proxyName: 'ERC1967Proxy',
                                                            implementationAddress:
                                                                '0x2548267A7247e357886C0D535Ff59223bB11cB68',
                                                        },
                                                        gaugeMetadata: {
                                                            name: 'Test gauge 123',
                                                            description: 'Description of the gauge for test....',
                                                            avatar: 'ipfs://QmTsCeejcmCCWLNWKDpsVdMg9TYU3sQ6fr1KVnUsHxaPxt',
                                                            links: [
                                                                { name: 'Test link 1', url: 'http://hello.com' },
                                                                { name: 'Test link 2', url: 'http://hello.com' },
                                                            ],
                                                        },
                                                        daoId,
                                                    } as IProposalActionData
                                                }
                                                actionFunctionSelector={selector}
                                                chainId={chainId}
                                                CustomComponent={customActionView.componentDetails}
                                            />
                                        );
                                    }
                                })}
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
