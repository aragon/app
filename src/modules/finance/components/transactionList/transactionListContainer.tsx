'use client';

import type { IDaoPlugin } from '@/shared/api/daoService';
import {
    type IFilterComponentPlugin,
    type IPluginFilterComponentProps,
    PluginFilterComponent,
} from '@/shared/components/pluginFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginFilterUrlParam } from '@/shared/hooks/useDaoPluginFilterUrlParam';
import { pluginGroupFilter } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import type { ReactNode } from 'react';
import type { IGetTransactionListParams } from '../../api/financeService';
import { TransactionListDefault } from './transactionListDefault';

export interface ITransactionListContainerProps
    extends Pick<IPluginFilterComponentProps<IDaoPlugin>, 'value' | 'onValueChange'> {
    value?: IFilterComponentPlugin<IDaoPlugin>;
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
    const { initialParams, daoId, value, onValueChange, ...otherProps } = props;

    const { t } = useTranslations();

    const { activePlugin, setActivePlugin, plugins } = useDaoPluginFilterUrlParam({
        daoId,
        type: PluginType.BODY,
        includeSubPlugins: true,
        includeGroupFilter: true,
        name: transactionListFilterParam,
        enableUrlUpdate: onValueChange == null,
    });

    const processedPlugins = plugins?.map((plugin) => {
        const isGroupTab = plugin.id === pluginGroupFilter.id;
        const baseQueryParams = initialParams.queryParams;
        const pluginQueryParams = isGroupTab ? baseQueryParams : { ...baseQueryParams, address: plugin.meta.address };
        const pluginInitialParams = { ...initialParams, queryParams: pluginQueryParams };

        const label = isGroupTab ? t('app.finance.transactionList.groupTab') : plugin.label;

        return { ...plugin, label, props: { initialParams: pluginInitialParams, plugin: plugin.meta } };
    });

    const resolvedValue = value ?? activePlugin;
    const resolvedOnValueChange = onValueChange ?? setActivePlugin;

    return (
        <PluginFilterComponent
            slotId="FINANCE_TRANSACTION_LIST"
            plugins={processedPlugins}
            Fallback={TransactionListDefault}
            value={resolvedValue}
            onValueChange={resolvedOnValueChange}
            searchParamName={transactionListFilterParam}
            {...otherProps}
        />
    );
};
