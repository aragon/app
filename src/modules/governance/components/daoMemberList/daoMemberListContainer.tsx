'use client';

import { useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';

import type { IDaoPlugin } from '@/shared/api/daoService';
import {
    type IFilterComponentPlugin,
    type IPluginFilterComponentProps,
    PluginFilterComponent,
} from '@/shared/components/pluginFilterComponent';
import { useDaoPluginFilterUrlParam } from '@/shared/hooks/useDaoPluginFilterUrlParam';
import { PluginType } from '@/shared/types';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import type { IGetMemberListParams } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { DaoMemberListDefault } from './daoMemberListDefault';

export const featuredDelegatesTabId = 'featured-delegates';

export interface IDaoMemberListContainerProps
    extends Pick<
        IPluginFilterComponentProps<IDaoPlugin>,
        'value' | 'onValueChange'
    > {
    /**
     * Initial parameters to use for fetching the member list.
     */
    initialParams: NestedOmit<
        IGetMemberListParams,
        'queryParams.pluginAddress'
    >;
    /**
     * Hides the pagination when set to true.
     */
    hidePagination?: boolean;
    /**
     * Children of the component.
     */
    children?: ReactNode;
    /**
     * Optional synthetic tab prepended before real plugin tabs (e.g. Featured delegates).
     */
    featuredDelegatesTab?: IFilterComponentPlugin<IDaoPlugin>;
}

export const daoMemberListFilterParam = 'members';

export const DaoMemberListContainer: React.FC<IDaoMemberListContainerProps> = (
    props,
) => {
    const {
        initialParams,
        value,
        onValueChange,
        featuredDelegatesTab,
        ...otherProps
    } = props;

    const searchParams = useSearchParams();
    const urlParam = searchParams.get(daoMemberListFilterParam);

    const { activePlugin, setActivePlugin, plugins } =
        useDaoPluginFilterUrlParam({
            daoId: initialParams.queryParams.daoId,
            type: PluginType.BODY,
            includeSubPlugins: true,
            includeLinkedAccounts: true,
            name: daoMemberListFilterParam,
            enableUrlUpdate: onValueChange == null,
            fallbackValue:
                featuredDelegatesTab != null
                    ? featuredDelegatesTabId
                    : undefined,
        });

    const processedPlugins = plugins?.map((plugin) => {
        const pluginInitialParams = {
            ...initialParams,
            queryParams: {
                ...initialParams.queryParams,
                pluginAddress: plugin.meta.address,
            },
        };

        return {
            ...plugin,
            props: { initialParams: pluginInitialParams, plugin: plugin.meta },
        };
    });

    const allPlugins: IFilterComponentPlugin<IDaoPlugin>[] | undefined =
        featuredDelegatesTab != null
            ? [featuredDelegatesTab, ...(processedPlugins ?? [])]
            : processedPlugins;

    // Pre-select the featured delegates tab when the URL param is absent or set to it.
    const resolvedValue: IFilterComponentPlugin<IDaoPlugin> | undefined =
        value ??
        (featuredDelegatesTab != null &&
        (urlParam == null || urlParam === featuredDelegatesTabId)
            ? featuredDelegatesTab
            : activePlugin);

    return (
        <PluginFilterComponent
            Fallback={DaoMemberListDefault}
            onValueChange={onValueChange ?? setActivePlugin}
            plugins={allPlugins}
            searchParamName={daoMemberListFilterParam}
            slotId={GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST}
            value={resolvedValue}
            {...otherProps}
        />
    );
};
