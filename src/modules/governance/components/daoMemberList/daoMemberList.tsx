'use client';

import { useDao } from '@/shared/api/daoService';
import { PluginComponent } from '@/shared/components/pluginComponent';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IDaoMemberListProps {
    /**
     * Slug of the DAO.
     */
    slug: string;
}

export const DaoMemberList: React.FC<IDaoMemberListProps> = (props) => {
    const { slug } = props;

    const useDaoParams = { slug };
    const { data: dao } = useDao({ urlParams: useDaoParams });

    return (
        <>
            {dao?.plugins.map((plugin) => (
                <PluginComponent
                    key={plugin.address}
                    slotId={GovernanceSlotId.DAO_MEMBER_LIST}
                    pluginId={plugin.subdomain}
                    pluginAddress={plugin.address}
                >
                    <p>Unsupported plugin {plugin.subdomain}</p>
                </PluginComponent>
            ))}
        </>
    );
};
