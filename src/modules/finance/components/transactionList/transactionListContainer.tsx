'use client';

import { DaoFilterComponent } from '@/shared/components/daoFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoFilterUrlParam } from '@/shared/hooks/useDaoFilterUrlParam';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import type { ReactNode } from 'react';
import type { IGetTransactionListParams } from '../../api/financeService';
import { TransactionListDefault } from './transactionListDefault';

export interface ITransactionListContainerProps {
    /**
     * Initial parameters to use for fetching the transaction list.
     */
    initialParams: NestedOmit<IGetTransactionListParams, 'queryParams.address'>;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Hides the pagination when set to true.
     */
    hidePagination?: boolean;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const transactionListFilterParam = 'subdao';

export const TransactionListContainer: React.FC<ITransactionListContainerProps> = (props) => {
    const { initialParams, daoId, ...otherProps } = props;

    const { t } = useTranslations();

    const { activeOption, setActiveOption, options } = useDaoFilterUrlParam({
        daoId,
        includeAllOption: true,
        name: transactionListFilterParam,
    });

    return (
        <DaoFilterComponent
            slotId="FINANCE_TRANSACTION_LIST"
            options={options}
            value={activeOption}
            onValueChange={setActiveOption}
            initialParams={initialParams}
            allOptionLabel={t('app.finance.transactionList.groupTab')}
            Fallback={TransactionListDefault}
            searchParamName={transactionListFilterParam}
            {...otherProps}
        />
    );
};
