'use client';

import type { ReactNode } from 'react';
import type { IDao } from '@/shared/api/daoService';
import type { IDaoFilterOption } from '@/shared/hooks/useDaoFilterUrlParam';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import type {
    IGetTransactionListParams,
    ITransactionExecution,
} from '../../api/financeService';
import { TransactionListDefault } from './transactionListDefault';

export interface ITransactionListContainerProps {
    initialParams: NestedOmit<IGetTransactionListParams, 'queryParams.address'>;
    /**
     * Linked-account (SubDAO) filter state. Owned by the page so a single
     * source of truth survives transient list unmounts (the container is
     * controlled and holds no filter state of its own).
     */
    bodyFilter?: {
        options: IDaoFilterOption[];
        value: IDaoFilterOption;
        onSelect: (option: IDaoFilterOption) => void;
    };
    hidePagination?: boolean;
    children?: ReactNode;
    onTransactionClick?: (transaction: ITransactionExecution) => void;
    dao?: IDao;
}

export const transactionListFilterParam = 'linkedaccount';

export const TransactionListContainer: React.FC<
    ITransactionListContainerProps
> = (props) => {
    const { initialParams, bodyFilter, ...otherProps } = props;

    const mergedParams: IGetTransactionListParams = {
        ...initialParams,
        queryParams: {
            ...initialParams.queryParams,
            daoId: bodyFilter?.value.daoId,
            address: undefined,
            onlyParent: bodyFilter?.value.onlyParent,
        },
    };

    return (
        <TransactionListDefault
            bodyFilter={bodyFilter}
            initialParams={mergedParams}
            {...otherProps}
        />
    );
};
