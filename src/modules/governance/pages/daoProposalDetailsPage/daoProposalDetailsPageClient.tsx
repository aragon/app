'use client';

import { useDao } from '@/shared/api/daoService';
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

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const chainId = dao ? networkDefinitions[dao.network].chainId : undefined;
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    if (proposal == null) {
        return null;
    }

    const formattedCreationDate = formatterUtils.formatDate(proposal.blockTimestamp * 1000, {
        format: DateFormat.YEAR_MONTH_DAY,
    });

    const creatorName = addressUtils.truncateAddress(proposal.creatorAddress);

    const creatorLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: proposal.creatorAddress });
    const creationBlockLink = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: proposal.transactionHash });

    const pageBreadcrumbs = [
        {
            href: `/dao/${daoId}/proposals`,
            label: t('app.governance.daoProposalDetailsPage.header.breadcrumb.proposals'),
        },
        { label: proposal.proposalId },
    ];

    return (
        <>
            <Page.Header breadcrumbs={pageBreadcrumbs} title={proposal.title} description={proposal.summary}>
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
                    {proposal.description && (
                        <Page.Section title={t('app.governance.daoProposalDetailsPage.main.proposal')}>
                            <CardCollapsible
                                buttonLabelClosed={t('app.governance.daoProposalDetailsPage.main.readMore')}
                                buttonLabelOpened={t('app.governance.daoProposalDetailsPage.main.readLess')}
                            >
                                <DocumentParser document={proposal.description} />
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
                                <Link href={creationBlockLink} target="_blank" iconRight={IconType.LINK_EXTERNAL}>
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
                </Page.Aside>
            </Page.Content>
        </>
    );
};
