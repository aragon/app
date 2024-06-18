'use client';

import { useDao } from '@/shared/api/daoService';
import { PluginComponent } from '@/shared/components/pluginComponent';
import type { ReactNode } from 'react';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IDaoMemberListProps {
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

export const DaoMemberList: React.FC<IDaoMemberListProps> = (props) => {
    const { daoId, hidePagination, children } = props;

    const useDaoParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: useDaoParams });

    return dao?.plugins.map((plugin) => (
        <PluginComponent
            key={plugin.address}
            slotId={GovernanceSlotId.DAO_MEMBER_LIST}
            // pluginId={plugin.type}
            pluginId="multisig"
            daoId={daoId}
            hidePagination={hidePagination}
        >
            {children}
        </PluginComponent>
    ));
};
