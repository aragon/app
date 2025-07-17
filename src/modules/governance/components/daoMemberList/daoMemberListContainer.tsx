'use client';

import type { IDaoPlugin } from '@/shared/api/daoService';
import { type IPluginTabComponentProps, PluginTabComponent } from '@/shared/components/pluginTabComponent';
import { useDaoPluginFilterUrlParam } from '@/shared/hooks/useDaoPluginFilterUrlParam';
import { PluginType } from '@/shared/types';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import type { ReactNode } from 'react';
import type { IGetMemberListParams } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { DaoMemberListDefault } from './daoMemberListDefault';

export interface IDaoMemberListContainerProps
    extends Pick<IPluginTabComponentProps<IDaoPlugin>, 'value' | 'onValueChange'> {
    /**
     * Initial parameters to use for fetching the member list.
     */
    initialParams: NestedOmit<IGetMemberListParams, 'queryParams.pluginAddress'>;
    /**
     * Hides the pagination when set to true.
     */
    hidePagination?: boolean;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const daoMemberListFilterParam = 'members';

export const DaoMemberListContainer: React.FC<IDaoMemberListContainerProps> = (props) => {
    const { initialParams, value, onValueChange, ...otherProps } = props;

    const { activePlugin, setActivePlugin, plugins } = useDaoPluginFilterUrlParam({
        daoId: initialParams.queryParams.daoId,
        type: PluginType.BODY,
        includeSubPlugins: true,
        name: daoMemberListFilterParam,
        enableUrlUpdate: onValueChange == null,
    });

    const processedPlugins = plugins.map((plugin) => {
        const pluginInitialParams = {
            ...initialParams,
            queryParams: { ...initialParams.queryParams, pluginAddress: plugin.meta.address },
        };

        return { ...plugin, props: { initialParams: pluginInitialParams, plugin: plugin.meta } };
    });

    return (
        <PluginTabComponent
            slotId={GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST}
            plugins={processedPlugins}
            Fallback={DaoMemberListDefault}
            value={value ?? activePlugin}
            onValueChange={onValueChange ?? setActivePlugin}
            searchParamName={daoMemberListFilterParam}
            {...otherProps}
        />
    );
};
