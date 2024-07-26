'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useCurrentUrl } from '@/shared/hooks/useCurrentUrl';
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
    useBlockExplorer,
} from '@aragon/ods';
import { useProposal } from '../../api/governanceService';

export interface IDaoProposalDetailsPageClientProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * The ID of the proposal.
     */
    proposalId: string;
}

export const DaoProposalDetailsPageClient: React.FC<IDaoProposalDetailsPageClientProps> = (props) => {
    const { daoId, proposalId } = props;

    const { t } = useTranslations();
    const pageUrl = useCurrentUrl();

    const proposalUrlParams = { id: proposalId };
    const proposalParams = { urlParams: proposalUrlParams };
    const { data: proposal } = useProposal(proposalParams);

    const chainId = proposal ? networkDefinitions[proposal.network].chainId : undefined;
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    if (proposal == null) {
        return null;
    }

    const { description, blockTimestamp, creatorAddress, transactionHash, summary, title, resources } = proposal;

    const formattedCreationDate = formatterUtils.formatDate(blockTimestamp * 1000, {
        format: DateFormat.YEAR_MONTH_DAY,
    });

    const creatorName = addressUtils.truncateAddress(creatorAddress);

    const creatorLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: creatorAddress });
    const creationBlockLink = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: transactionHash });

    const pageBreadcrumbs = [
        {
            href: `/dao/${daoId}/proposals`,
            label: t('app.governance.daoProposalDetailsPage.header.breadcrumb.proposals'),
        },
        { label: proposal.proposalId },
    ];

    return (
        <>
            <Page.Header breadcrumbs={pageBreadcrumbs} title={title} description={summary}>
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
                        <Page.Section title={t('app.governance.daoProposalDetailsPage.main.proposal')}>
                            <CardCollapsible
                                buttonLabelClosed={t('app.governance.daoProposalDetailsPage.main.readMore')}
                                buttonLabelOpened={t('app.governance.daoProposalDetailsPage.main.readLess')}
                            >
                                <DocumentParser document={description} />
                            </CardCollapsible>
                        </Page.Section>
                    )}
                </Page.Main>
                <Page.Aside>
                    <Page.Section title={t('app.governance.daoProposalDetailsPage.aside.details.title')} inset={false}>
                        <DefinitionList.Container>
                            <DefinitionList.Item term={t('app.governance.daoProposalDetailsPage.aside.details.id')}>
                                <p className="text-neutral-500">{proposal.proposalId}</p>
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                term={t('app.governance.daoProposalDetailsPage.aside.details.published')}
                            >
                                <Link
                                    href={creationBlockLink}
                                    target="_blank"
                                    iconRight={IconType.LINK_EXTERNAL}
                                    className="first-letter:capitalize"
                                >
                                    {formattedCreationDate}
                                </Link>
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                term={t('app.governance.daoProposalDetailsPage.aside.details.creator')}
                            >
                                <Link href={creatorLink} target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                                    {creatorName}
                                </Link>
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                    </Page.Section>
                    {resources.length > 0 && (
                        <Page.Section title={t('app.governance.daoProposalDetailsPage.aside.links.title')}>
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
                        </Page.Section>
                    )}
                </Page.Aside>
            </Page.Content>
        </>
    );
};
