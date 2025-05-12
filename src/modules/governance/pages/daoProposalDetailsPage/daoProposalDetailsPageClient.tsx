'use client';

import { ProposalExecutionStatus } from '@/modules/governance/components/proposalExecutionStatus';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useCurrentUrl } from '@/shared/hooks/useCurrentUrl';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import {
    addressUtils,
    Button,
    CardCollapsible,
    ChainEntityType,
    clipboardUtils,
    DateFormat,
    DefinitionList,
    DocumentParser,
    formatterUtils,
    IconType,
    Link,
    ProposalActions,
    type ProposalStatus,
    proposalStatusToTagVariant,
    Tag,
    useBlockExplorer,
    useGukModulesContext,
} from '@aragon/gov-ui-kit';
import { type IProposal, useProposalActions, useProposalBySlug } from '../../api/governanceService';
import { ProposalVotingTerminal } from '../../components/proposalVotingTerminal';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { proposalActionUtils } from '../../utils/proposalActionUtils';
import { proposalUtils } from '../../utils/proposalUtils';

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

export const DaoProposalDetailsPageClient: React.FC<IDaoProposalDetailsPageClientProps> = (props) => {
    const { daoId, proposalSlug } = props;

    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer();
    const { copy } = useGukModulesContext();
    const pageUrl = useCurrentUrl();

    const proposalUrlParams = { slug: proposalSlug };
    const proposalParams = {
        urlParams: proposalUrlParams,
        queryParams: { daoId },
    };
    const { data: proposal } = useProposalBySlug(proposalParams);

    const daoParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoParams });

    const proposalStatus = useSlotSingleFunction<IProposal, ProposalStatus>({
        params: proposal!,
        slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
        pluginId: proposal?.pluginSubdomain ?? '',
    })!;

    const plugin = useDaoPlugins({ daoId, pluginAddress: proposal?.pluginAddress })?.[0];

    const { data: actionData } = useProposalActions(
        { urlParams: { id: proposal?.id as string } },
        { enabled: proposal != null },
    );

    if (proposal == null || dao == null) {
        return null;
    }

    const slug = proposalUtils.getProposalSlug(proposal.incrementalId, plugin?.meta);

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
    const pageBreadcrumbs = [
        {
            href: `/dao/${daoId}/proposals`,
            label: t('app.governance.daoProposalDetailsPage.header.breadcrumb.proposals'),
        },
        { label: slug },
    ];

    return (
        <>
            <Page.Header breadcrumbs={pageBreadcrumbs} breadcrumbsTag={statusTag} title={title} description={summary}>
                <div className="flex flex-row gap-4">
                    <Button
                        variant="tertiary"
                        size="md"
                        iconRight={IconType.LINK_EXTERNAL}
                        onClick={() => clipboardUtils.copy(pageUrl)}
                    >
                        {t('app.governance.daoProposalDetailsPage.header.action.share')}
                    </Button>
                </div>
            </Page.Header>
            <Page.Content>
                <Page.Main>
                    {description && (
                        <Page.MainSection title={t('app.governance.daoProposalDetailsPage.main.description.header')}>
                            <CardCollapsible
                                buttonLabelClosed={t('app.governance.daoProposalDetailsPage.main.description.readMore')}
                                buttonLabelOpened={t('app.governance.daoProposalDetailsPage.main.description.readLess')}
                            >
                                <DocumentParser document={description} />
                            </CardCollapsible>
                        </Page.MainSection>
                    )}
                    <Page.MainSection title={t('app.governance.daoProposalDetailsPage.main.voting')}>
                        <PluginSingleComponent
                            slotId={GovernanceSlotId.GOVERNANCE_PROPOSAL_VOTING_TERMINAL}
                            pluginId={proposal.pluginSubdomain}
                            proposal={proposal}
                            status={proposalStatus}
                            daoId={daoId}
                            Fallback={ProposalVotingTerminal}
                        />
                    </Page.MainSection>
                    <Page.MainSection title={t('app.governance.daoProposalDetailsPage.main.actions.header')}>
                        <ProposalActions.Root actionsCount={normalizedProposalActions.length}>
                            <ProposalActions.Container emptyStateDescription="">
                                {normalizedProposalActions.map((action, index) => (
                                    <ProposalActions.Item key={index} action={action} chainId={chainId} />
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
                            >
                                <p className="break-words text-neutral-500">{proposal.proposalIndex}</p>
                            </DefinitionList.Item>
                            <DefinitionList.Item term={t('app.governance.daoProposalDetailsPage.aside.details.id')}>
                                <p className="truncate text-neutral-500">{slug}</p>
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                term={t('app.governance.daoProposalDetailsPage.aside.details.published')}
                                link={{ href: creationBlockLink, textClassName: 'first-letter:capitalize' }}
                            >
                                {formattedCreationDate}
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                term={t('app.governance.daoProposalDetailsPage.aside.details.creator')}
                                link={{ href: creatorLink }}
                            >
                                {creatorName}
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
                                    <Link
                                        key={resource.name}
                                        href={resource.url}
                                        target="_blank"
                                        iconRight={IconType.LINK_EXTERNAL}
                                        description={resource.url}
                                    >
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
