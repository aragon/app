'use client';

import { useDao } from '@/shared/api/daoService';
import { PluginComponent } from '@/shared/components/pluginComponent';
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

    const useDaoParams = { id: initialParams.queryParams.daoId };
    const { data: dao } = useDao({ urlParams: useDaoParams });
    const pluginIds = dao?.plugins.map((plugin) => plugin.subdomain) ?? [];

    return (
        <PluginComponent
            slotId={GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST}
            pluginIds={pluginIds}
            initialParams={initialParams}
            {...otherProps}
        />
    );
};
