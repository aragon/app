'use client';

import type { IDaoPlugin } from '@/shared/api/daoService';
import { type IPluginTabComponentProps, PluginTabComponent } from '@/shared/components/pluginTabComponent';
import { useDaoPluginTabParam } from '@/shared/hooks/useDaoPluginTabParam';
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

export const daoMemberListSearchParam = 'membersTab';

export const DaoMemberListContainer: React.FC<IDaoMemberListContainerProps> = (props) => {
    const { initialParams, value, onValueChange, ...otherProps } = props;

    const { selectedPlugin, setSelectedPlugin, plugins } = useDaoPluginTabParam({
        name: daoMemberListSearchParam,
        daoId: initialParams.queryParams.daoId,
        type: PluginType.BODY,
        includeSubPlugins: true,
        enabled: onValueChange == null,
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
            value={value ?? selectedPlugin}
            onValueChange={onValueChange ?? setSelectedPlugin}
            searchParamName={daoMemberListSearchParam}
            {...otherProps}
        />
    );
};
