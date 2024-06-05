'use client';

import { useDao } from '@/shared/api/daoService';
import { pluginUtils } from '@/shared/utils/pluginUtils';
import { useEffect, useState, type ComponentType } from 'react';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IDaoMemberListProps {
    /**
     * DAO slug to display the member of.
     */
    daoSlug: string;
}

const defaultComponent = () => <div />;

export const DaoMemberList: React.FC<IDaoMemberListProps> = (props) => {
    const { daoSlug } = props;

    const [Component, setComponent] = useState<ComponentType>(() => defaultComponent);

    const daoParams = { slug: daoSlug };
    const { data: dao } = useDao({ urlParams: daoParams });

    useEffect(() => {
        const loadedComponent = pluginUtils.getSlotComponent({
            slotId: GovernanceSlotId.DAO_MEMBER_LIST,
            pluginId: 'multisig.dao.eth',
        });

        if (loadedComponent) {
            setComponent(() => loadedComponent);
        }
    }, []);

    return (
        <div>
            <p>DAO member list for dao {dao?.name}</p>
            <Component />
        </div>
    );
};
