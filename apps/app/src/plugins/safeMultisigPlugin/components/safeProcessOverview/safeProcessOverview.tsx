'use client';

import {
    AlertInline,
    Button,
    DataListContainer,
    DataListRoot,
    IconType,
    ProposalDataListItem,
    useGukCoreContext,
} from '@aragon/gov-ui-kit';
import { useEnsName } from '@/modules/ens';
import { safeDataListUtils } from '@/modules/safe/utils/safeDataListUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { ISafeDaoProposal } from '../../hooks/useSafeDaoProposals';
import { useSafeDaoProposals } from '../../hooks/useSafeDaoProposals';
import { safeDaoProposalUtils } from '../../utils/safeDaoProposalUtils';

interface ISafeProcessOverviewItemProps {
    daoUrl: string;
    proposal: ISafeDaoProposal;
    safeAddress: string;
}

const SafeProcessOverviewItem: React.FC<ISafeProcessOverviewItemProps> = ({
    daoUrl,
    proposal,
    safeAddress,
}) => {
    const { transaction, status } = proposal;
    const proposalDisplayId =
        safeDaoProposalUtils.getProposalDisplayId(transaction);
    const { data: proposerEnsName } = useEnsName(transaction.from ?? undefined);
    const proposerAddress = transaction.from ?? '';

    return (
        <ProposalDataListItem.Structure
            date={transaction.executionDate ?? transaction.submissionDate}
            href={`${daoUrl}/proposals/safe/${transaction.safeTxHash}?safeAddress=${encodeURIComponent(safeAddress)}`}
            id={proposalDisplayId}
            publisher={{
                address: proposerAddress,
                link:
                    transaction.from == null
                        ? undefined
                        : `${daoUrl}/members/${transaction.from}`,
                name: proposerEnsName ?? undefined,
            }}
            status={status}
            summary=""
            title=""
        />
    );
};

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
    const { copy } = useGukCoreContext();
    const { network, address: rootDaoAddress } = daoUtils.parseDaoId(
        initialParams.queryParams.daoId,
    );
    const daoAddress = plugin.daoAddress ?? rootDaoAddress;
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isError,
        isFetchNextPageError,
        isFetchingNextPage,
        isIndexing,
        isLoading,
        isPartial,
        isStale,
    } = useSafeDaoProposals({
        network,
        safeAddress: plugin.address,
        daoAddress,
    });
    const daoUrl = `/dao/${network}/${daoAddress}`;
    const state = safeDataListUtils.getDataListState({
        isError: isError && data == null,
        isLoading,
    });

    return (
        <>
            {!isLoading &&
                (isStale ||
                    isPartial ||
                    isIndexing ||
                    isFetchNextPageError) && (
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
                pageSize={Math.max(data?.proposals.length ?? 0, 1)}
                state={state}
            >
                <DataListContainer
                    emptyState={{
                        heading: t(
                            'app.plugins.safeMultisig.safeProcess.emptyHeading',
                        ),
                        description: t(
                            'app.plugins.safeMultisig.safeProcess.emptyDescription',
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
                    {data?.proposals.map((proposal) => (
                        <SafeProcessOverviewItem
                            daoUrl={daoUrl}
                            key={`${plugin.address}:${proposal.transaction.safeTxHash}`}
                            proposal={proposal}
                            safeAddress={plugin.address}
                        />
                    ))}
                </DataListContainer>
                {hasNextPage && (
                    <Button
                        className="mt-4"
                        iconRight={IconType.CHEVRON_DOWN}
                        isLoading={isFetchingNextPage}
                        onClick={() => {
                            void fetchNextPage();
                        }}
                        variant="tertiary"
                    >
                        {copy.dataListPagination.more}
                    </Button>
                )}
            </DataListRoot>
        </>
    );
};
