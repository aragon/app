'use client';

import { useSearchParams } from 'next/navigation';
import { type ReactNode, useMemo } from 'react';
import {
    type IDaoPlugin,
    PluginInterfaceType,
    useDao,
} from '@/shared/api/daoService';
import {
    type IFilterComponentPlugin,
    type IPluginFilterComponentProps,
    PluginFilterComponent,
} from '@/shared/components/pluginFilterComponent';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import type { IGetMemberListParams } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import {
    daoMemberSourceUtils,
    type IDaoMemberSource,
} from '../../utils/daoMemberSourceUtils';
import { DaoMemberListDefault } from './daoMemberListDefault';

export const featuredDelegatesTabId = 'featured-delegates';

type DaoMemberListFilterMeta = IDaoMemberSource | IDaoPlugin;
type DaoMemberListFilterPlugin =
    IFilterComponentPlugin<DaoMemberListFilterMeta>;

export interface IDaoMemberListContainerProps
    extends Pick<
        IPluginFilterComponentProps<DaoMemberListFilterMeta>,
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
    featuredDelegatesTab?: DaoMemberListFilterPlugin;
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
        ...contentProps
    } = props;

    const searchParams = useSearchParams();
    const urlParam = searchParams.get(daoMemberListFilterParam);

    const { data: dao } = useDao({
        urlParams: { id: initialParams.queryParams.daoId },
    });
    const bodyPlugins = useDaoPlugins({
        daoId: initialParams.queryParams.daoId,
        type: PluginType.BODY,
        includeSubPlugins: true,
        includeLinkedAccounts: true,
        visibleOnly: true,
    });
    const processPlugins = useDaoPlugins({
        daoId: initialParams.queryParams.daoId,
        interfaceType: PluginInterfaceType.SPP,
        includeSubPlugins: true,
        includeLinkedAccounts: true,
    });

    const memberSources = useMemo(() => {
        if (dao == null || bodyPlugins == null || processPlugins == null) {
            return [];
        }

        return daoMemberSourceUtils.resolve({
            dao,
            daoId: initialParams.queryParams.daoId,
            bodyPlugins: bodyPlugins.map(({ meta }) => meta),
            processPlugins: processPlugins.map(({ meta }) => meta),
        });
    }, [bodyPlugins, dao, initialParams.queryParams.daoId, processPlugins]);

    const processedPlugins: DaoMemberListFilterPlugin[] = memberSources.map(
        (memberSource) => {
            const pluginInitialParams = {
                ...initialParams,
                queryParams: {
                    ...initialParams.queryParams,
                    pluginAddress: memberSource.address,
                },
            };

            return {
                id: memberSource.id,
                uniqueId: memberSource.uniqueId,
                label: memberSource.label,
                meta: memberSource,
                props: {},
                renderContent: () =>
                    memberSource.kind === 'plugin' ? (
                        <PluginSingleComponent
                            Fallback={DaoMemberListDefault}
                            initialParams={pluginInitialParams}
                            memberSource={memberSource}
                            plugin={memberSource.plugin}
                            pluginId={memberSource.id}
                            slotId={GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST}
                            {...contentProps}
                        />
                    ) : (
                        <DaoMemberListDefault
                            initialParams={pluginInitialParams}
                            memberSource={memberSource}
                            {...contentProps}
                        />
                    ),
            };
        },
    );

    const allPlugins: DaoMemberListFilterPlugin[] =
        featuredDelegatesTab != null
            ? [featuredDelegatesTab, ...processedPlugins]
            : processedPlugins;

    const resolvedValue =
        value ??
        (featuredDelegatesTab != null &&
        (urlParam == null || urlParam === featuredDelegatesTabId)
            ? featuredDelegatesTab
            : undefined);

    return (
        <PluginFilterComponent
            onValueChange={onValueChange}
            plugins={allPlugins}
            searchParamName={daoMemberListFilterParam}
            value={resolvedValue}
        />
    );
};
