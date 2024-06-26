'use client';

import { PluginComponent } from '@/shared/components/pluginComponent';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import type { ReactNode } from 'react';
import type { IGetMemberListParams } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IDaoMemberListProps {
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
    const { initialParams, ...otherProps } = props;
    const pluginIds = useDaoPluginIds(initialParams.queryParams.daoId);

    return (
        <PluginComponent
            slotId={GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST}
            pluginIds={pluginIds}
            initialParams={initialParams}
            {...otherProps}
        />
    );
};
