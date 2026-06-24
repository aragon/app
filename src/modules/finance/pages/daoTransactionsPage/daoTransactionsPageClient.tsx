'use client';

import { keepPreviousData } from '@tanstack/react-query';
import { DispatchPanel } from '@/modules/capitalFlow/components/dispatchPanel';
import {
    useAssetList,
    useTransactionList,
} from '@/modules/finance/api/financeService';
import { DaoFilterAsideCard } from '@/modules/finance/components/daoFilterAsideCard';
import { FinanceDialogId } from '@/modules/finance/constants/financeDialogId';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoExecutePermission } from '@/shared/hooks/useDaoExecutePermission';
import { useDaoFilterUrlParam } from '@/shared/hooks/useDaoFilterUrlParam';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { IGetTransactionListParams } from '../../api/financeService';
import {
    TransactionList,
    transactionListFilterParam,
} from '../../components/transactionList';

export interface IDaoTransactionsPageClientProps {
    /**
     * ID of the DAO.
     */
    id: string;
    /**
     * Initial parameters to use to fetch the DAO transactions list.
     */
    initialParams: NestedOmit<IGetTransactionListParams, 'queryParams.address'>;
}

export const DaoTransactionsPageClient: React.FC<
    IDaoTransactionsPageClientProps
> = (props) => {
    const { id, initialParams } = props;
    const { t } = useTranslations();
    const { isEnabled } = useFeatureFlags();
    const { open } = useDialogContext();
    const isAutomationEnabled = isEnabled('capitalFlowAutomation');

    const { activeOption, setActiveOption, options } = useDaoFilterUrlParam({
        daoId: id,
        includeAllOption: true,
        name: transactionListFilterParam,
    });

    // Own the linked-account filter here (single source of truth). The page
    // never unmounts on a filter refetch, so the selection can't be wiped by
    // useFilterUrlParam's unmount cleanup the way a container-owned instance was.
    const bodyFilter =
        activeOption != null && options != null
            ? { options, value: activeOption, onSelect: setActiveOption }
            : undefined;

    // Keep the previous DAO while an onlyParent-driven refetch is in flight so
    // the page never transiently returns null on a filter change — unmounting
    // the list would trigger useFilterUrlParam's cleanup and wipe the selection.
    const { data: dao } = useDao(
        {
            urlParams: { id },
            queryParams: { onlyParent: activeOption?.onlyParent },
        },
        { placeholderData: keepPreviousData },
    );

    const { hasPermission } = useDaoExecutePermission({ dao });

    const allTransactionsSelected = activeOption?.isAll ?? false;
    const selectedDaoId = activeOption?.daoId ?? id;

    // Fetch assets for "All" view
    const { data: allAssetsMetadata } = useAssetList(
        {
            queryParams: {
                daoId: id,
            },
        },
        { enabled: allTransactionsSelected },
    );

    // Fetch transactions for selected DAO view
    const { data: selectedTransactionsMetadata } = useTransactionList(
        {
            queryParams: {
                ...initialParams.queryParams,
                daoId: selectedDaoId,
                onlyParent: activeOption?.onlyParent,
            },
        },
        { enabled: !allTransactionsSelected },
    );

    if (dao == null) {
        return null;
    }

    return (
        <Page.Content>
            <Page.Main
                action={{
                    label: t(
                        'app.finance.daoTransactionsPage.main.newTransaction',
                    ),
                    href: daoUtils.getDaoUrl(dao, 'create/execute'),
                    hidden: !hasPermission,
                }}
                title={t('app.finance.daoTransactionsPage.main.title')}
            >
                <TransactionList.Container
                    bodyFilter={bodyFilter}
                    dao={dao}
                    initialParams={initialParams}
                    onTransactionClick={(transaction) =>
                        open(FinanceDialogId.TRANSACTION_DETAIL, {
                            params: { dao, transaction },
                        })
                    }
                />
            </Page.Main>
            <Page.Aside>
                <DaoFilterAsideCard
                    activeOption={activeOption}
                    allMetadata={allAssetsMetadata?.pages[0]}
                    dao={dao}
                    selectedMetadata={selectedTransactionsMetadata?.pages[0]}
                    statsType="transactions"
                />
                {isAutomationEnabled && (
                    <DispatchPanel
                        daoAddress={dao.address}
                        network={dao.network}
                    />
                )}
            </Page.Aside>
        </Page.Content>
    );
};
