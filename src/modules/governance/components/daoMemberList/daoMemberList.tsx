'use client';

import type { IDaoPlugin } from '@/shared/api/daoService';
import { type IPluginTabComponentProps, PluginTabComponent } from '@/shared/components/pluginTabComponent';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import type { ReactNode } from 'react';
import type { IGetMemberListParams } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IDaoMemberListProps extends Pick<IPluginTabComponentProps<IDaoPlugin>, 'value' | 'onValueChange'> {
    /**
     * Initial parameters to use for fetching the member list.
     */
    initialParams: IGetMemberListParams;
    /**
     * Hides the pagination when set to true.
     */
    hidePagination?: boolean;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const DaoMemberList: React.FC<IDaoMemberListProps> = (props) => {
    const { initialParams, value, ...otherProps } = props;

    const bodyPlugins = useDaoPlugins({ daoId: initialParams.queryParams.daoId, type: PluginType.BODY });

    const pluginQueryParams = { ...initialParams.queryParams, pluginAddress: value?.meta.address };
    const processedParams = { ...initialParams, queryParams: pluginQueryParams };

    return (
        <PluginTabComponent
            slotId={GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST}
            plugins={bodyPlugins}
            value={value}
            initialParams={processedParams}
            {...otherProps}
        />
    );
};
