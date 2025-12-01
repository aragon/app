'use client';

import type { IDaoPlugin } from '@/shared/api/daoService';
import { useDao } from '@/shared/api/daoService';
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
import { subDaoDisplayUtils } from '@/shared/utils/subDaoDisplayUtils';
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
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { activePlugin, setActivePlugin, plugins } = useDaoPluginFilterUrlParam({
        daoId,
        type: PluginType.BODY,
        includeSubPlugins: true,
        includeGroupFilter: true,
        name: transactionListFilterParam,
        enableUrlUpdate: onValueChange == null,
    });

    const seenDaoAddresses = new Set<string>();
    const processedPlugins = plugins
        ?.map((plugin) => {
            const isGroupTab = plugin.id === pluginGroupFilter.id;
            const baseQueryParams = { ...initialParams.queryParams };
            const pluginDaoId = isGroupTab
                ? daoId
                : `${dao?.network ?? ''}-${plugin.meta.daoAddress ?? plugin.meta.address}`;
            const pluginQueryParams = { ...baseQueryParams, daoId: pluginDaoId, address: undefined };
            const pluginInitialParams = { ...initialParams, queryParams: pluginQueryParams };

            const pluginDaoAddress = (plugin.meta.daoAddress ?? dao?.address ?? '').toLowerCase();
            const isDuplicateSubDao = !isGroupTab && pluginDaoAddress !== '' && seenDaoAddresses.has(pluginDaoAddress);
            if (isDuplicateSubDao) {
                return null;
            }

            if (!isGroupTab && pluginDaoAddress !== '') {
                seenDaoAddresses.add(pluginDaoAddress);
            }

            const label = isGroupTab
                ? t('app.finance.transactionList.groupTab')
                : subDaoDisplayUtils.getPluginDisplayName({
                      dao,
                      plugin: plugin.meta,
                      groupLabel: t('app.finance.transactionList.groupTab'),
                      fallbackLabel: plugin.label,
                  });

            return { ...plugin, label, props: { initialParams: pluginInitialParams, plugin: plugin.meta } };
        })
        .filter((plugin): plugin is IFilterComponentPlugin<IDaoPlugin> => plugin != null);

    const resolvedValue = value ?? activePlugin;
    const resolvedValueWithLabel =
        processedPlugins?.find((plugin) => plugin.uniqueId === resolvedValue?.uniqueId) ?? resolvedValue;
    const resolvedOnValueChange = onValueChange ?? setActivePlugin;

    return (
        <PluginFilterComponent
            slotId="FINANCE_TRANSACTION_LIST"
            plugins={processedPlugins}
            Fallback={TransactionListDefault}
            value={resolvedValueWithLabel}
            onValueChange={resolvedOnValueChange}
            searchParamName={transactionListFilterParam}
            {...otherProps}
        />
    );
};
