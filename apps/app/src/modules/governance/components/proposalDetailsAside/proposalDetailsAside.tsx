'use client';

import { DefinitionList, Tag } from '@aragon/gov-ui-kit';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IProposalDetailsAsideProps } from './proposalDetailsAside.api';

export const ProposalDetailsAside: React.FC<IProposalDetailsAsideProps> = ({
    id,
    idCopyValue,
    onChainId,
    creatorAddress,
    creatorEnsName,
    creatorLink,
    publishedDate,
    publishedLink,
    statusLabel,
    statusVariant,
    children,
}) => {
    const { t } = useTranslations();

    return (
        <Page.AsideCard
            data-testid="proposal-details-container"
            title={t(
                'app.governance.daoProposalDetailsPage.aside.details.title',
            )}
        >
            <DefinitionList.Container>
                {onChainId != null && (
                    <DefinitionList.Item
                        copyValue={onChainId}
                        term={t(
                            'app.governance.daoProposalDetailsPage.aside.details.onChainId',
                        )}
                    >
                        <p className="truncate text-neutral-500">{onChainId}</p>
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item
                    copyValue={idCopyValue}
                    term={t(
                        'app.governance.daoProposalDetailsPage.aside.details.id',
                    )}
                >
                    <p className="truncate text-neutral-500">{id}</p>
                </DefinitionList.Item>
                {creatorAddress != null && (
                    <DefinitionList.Item
                        copyValue={creatorEnsName ? creatorAddress : undefined}
                        link={
                            creatorLink != null
                                ? { href: creatorLink, isOnchainEntity: true }
                                : undefined
                        }
                        term={t(
                            'app.governance.daoProposalDetailsPage.aside.details.creator',
                        )}
                    >
                        {creatorEnsName ?? creatorAddress}
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item
                    link={
                        publishedLink != null
                            ? {
                                  href: publishedLink,
                                  textClassName: 'first-letter:capitalize',
                              }
                            : undefined
                    }
                    term={t(
                        'app.governance.daoProposalDetailsPage.aside.details.published',
                    )}
                >
                    {publishedDate ?? '-'}
                </DefinitionList.Item>
                <DefinitionList.Item
                    term={t(
                        'app.governance.daoProposalDetailsPage.aside.details.status',
                    )}
                >
                    <Tag
                        className="w-fit"
                        label={statusLabel}
                        variant={statusVariant}
                    />
                </DefinitionList.Item>
                {children}
            </DefinitionList.Container>
        </Page.AsideCard>
    );
};
