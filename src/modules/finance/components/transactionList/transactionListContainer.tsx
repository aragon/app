'use client';

import type { ReactNode } from 'react';
import type { IDao } from '@/shared/api/daoService';
import { useDaoFilterUrlParam } from '@/shared/hooks/useDaoFilterUrlParam';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import type {
    IGetTransactionListParams,
    ITransactionExecution,
} from '../../api/financeService';
import { TransactionListDefault } from './transactionListDefault';

export interface ITransactionListContainerProps {
    initialParams: NestedOmit<IGetTransactionListParams, 'queryParams.address'>;
    daoId: string;
    hidePagination?: boolean;
    children?: ReactNode;
    onTransactionClick?: (transaction: ITransactionExecution) => void;
    dao?: IDao;
}

export const transactionListFilterParam = 'linkedaccount';

export const TransactionListContainer: React.FC<
    ITransactionListContainerProps
> = (props) => {
    const { initialParams, daoId, ...otherProps } = props;

    const { activeOption, setActiveOption, options } = useDaoFilterUrlParam({
        daoId,
        includeAllOption: true,
        name: transactionListFilterParam,
    });

    const mergedParams: IGetTransactionListParams = {
        ...initialParams,
        queryParams: {
            ...initialParams.queryParams,
            daoId: activeOption?.daoId,
            address: undefined,
            onlyParent: activeOption?.onlyParent,
        },
    };

    const bodyFilter =
        activeOption != null && options != null
            ? { options, value: activeOption, onSelect: setActiveOption }
            : undefined;

    return (
        <TransactionListDefault
            bodyFilter={bodyFilter}
            initialParams={mergedParams}
            {...otherProps}
        />
    );
};
