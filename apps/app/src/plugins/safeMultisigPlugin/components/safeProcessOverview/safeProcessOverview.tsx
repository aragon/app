'use client';

import {
    AlertInline,
    Button,
    Card,
    DataListContainer,
    DataListPagination,
    DataListRoot,
    IconType,
    ProposalDataListItem,
} from '@aragon/gov-ui-kit';
import Image from 'next/image';
import safeWallet from '@/assets/images/safeWallet.png';
import { safeAppAccountUrl } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import { safeDataListUtils } from '@/modules/safe/utils/safeDataListUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useSafeDaoProposals } from '../../hooks/useSafeDaoProposals';

const proposalsPerPage = 6;

/** Transaction destination for a Safe process; Safe transactions are not indexed Aragon proposals. */
export interface ISafeProcessOverviewProps {
    plugin: IDaoPlugin;
    initialParams: { queryParams: { daoId: string } };
}

export const SafeProcessOverview: React.FC<ISafeProcessOverviewProps> = ({
    plugin,
    initialParams,
}) => {
    const { t } = useTranslations();
    const { network, address: rootDaoAddress } = daoUtils.parseDaoId(
        initialParams.queryParams.daoId,
    );
    const daoAddress = plugin.daoAddress ?? rootDaoAddress;
    const { data, isError, isLoading, isPartial, isStale } =
        useSafeDaoProposals({
            network,
            safeAddress: plugin.address,
            daoAddress,
        });
    const safeUrl = safeAppAccountUrl({ network, address: plugin.address });
    const daoUrl = `/dao/${network}/${daoAddress}`;
    const state = safeDataListUtils.getDataListState({
        isError,
        isLoading,
    });

    return (
        <>
            <Card className="mb-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                    <Image
                        alt={t('app.plugins.safeMultisig.safeProcess.logoAlt')}
                        height={32}
                        src={safeWallet}
                        width={32}
                    />
                    <div>
                        <h2 className="text-lg text-neutral-800">
                            {t(
                                'app.plugins.safeMultisig.safeProcess.transactionsTitle',
                            )}
                        </h2>
                        <p className="text-neutral-500 text-sm">
                            {t(
                                'app.plugins.safeMultisig.safeProcess.transactionsDescription',
                            )}
                        </p>
                    </div>
                </div>
                {safeUrl != null && (
                    <Button
                        href={safeUrl}
                        iconRight={IconType.LINK_EXTERNAL}
                        rel="noopener"
                        target="_blank"
                        variant="tertiary"
                    >
                        {t('app.plugins.safeMultisig.safeProcess.viewInSafe')}
                    </Button>
                )}
            </Card>
            {(isStale || isPartial) && (
                <AlertInline
                    className="mb-4"
                    message={t(
                        'app.plugins.safeMultisig.safeProcess.transactionsStale',
                    )}
                    variant="warning"
                />
            )}
            <DataListRoot
                entityLabel={t('app.safe.safePendingTransactionList.entity')}
                itemsCount={data?.proposals.length ?? 0}
                pageSize={proposalsPerPage}
                state={state}
            >
                <DataListContainer
                    emptyState={{
                        heading: t(
                            'app.safe.safePendingTransactionList.empty.heading',
                        ),
                        description: t(
                            'app.safe.safePendingTransactionList.empty.description',
                        ),
                        objectIllustration: { object: 'ACTION' },
                    }}
                    errorState={{
                        heading: t(
                            'app.safe.safePendingTransactionList.error.heading',
                        ),
                        description: t(
                            'app.safe.safePendingTransactionList.error.description',
                        ),
                        objectIllustration: { object: 'ERROR' },
                    }}
                    layoutClassName="grid grid-cols-1"
                >
                    {data?.proposals.map(({ transaction, status, actions }) => (
                        <ProposalDataListItem.Structure
                            date={
                                transaction.executionDate ??
                                transaction.submissionDate
                            }
                            href={`${daoUrl}/proposals/safe/${transaction.safeTxHash}?safeAddress=${encodeURIComponent(plugin.address)}`}
                            id={`${plugin.address}:${transaction.safeTxHash}`}
                            key={`${plugin.address}:${transaction.safeTxHash}`}
                            publisher={{ address: plugin.address }}
                            status={status}
                            summary={t(
                                actions.length === 1
                                    ? 'app.safe.safeDaoProposalDetails.oneAction'
                                    : 'app.safe.safeDaoProposalDetails.manyActions',
                                { count: actions.length },
                            )}
                            title={t('app.safe.safeDaoProposalDetails.title', {
                                nonce: transaction.nonce,
                            })}
                        />
                    ))}
                </DataListContainer>
                <DataListPagination />
            </DataListRoot>
        </>
    );
};
