'use client';

import type { IDaoPlugin } from '@/shared/api/daoService';
import { useFeaturedDelegates } from '../../hooks/useFeaturedDelegates';
import { TokenMemberListItem } from '../tokenMemberList/components/tokenMemberListItem';
import type { ITokenMemberListPluginSettings } from '../tokenMemberList/tokenMemberListBase';

export interface IFeaturedDelegatesListProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Token voting plugin with settings (token address, network, etc.).
     */
    plugin: IDaoPlugin<ITokenMemberListPluginSettings>;
    /**
     * Featured delegate addresses from CMS.
     */
    addresses: string[];
}

export const FeaturedDelegatesList: React.FC<IFeaturedDelegatesListProps> = (
    props,
) => {
    const { daoId, plugin, addresses } = props;

    const delegates = useFeaturedDelegates({
        addresses,
        daoId,
        pluginAddress: plugin.address,
        token: plugin.settings.token,
    });

    return (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {delegates.map((member) => (
                <TokenMemberListItem
                    daoId={daoId}
                    key={member.address}
                    member={member}
                    plugin={plugin}
                />
            ))}
        </div>
    );
};
