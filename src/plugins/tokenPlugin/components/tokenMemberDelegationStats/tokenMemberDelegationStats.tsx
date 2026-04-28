'use client';

import { Card } from '@aragon/gov-ui-kit';
import type { ITokenPlugin } from '../../types';

export interface ITokenMemberDelegationStatsProps {
    /**
     * DAO plugin to display the delegation section for.
     */
    plugin: ITokenPlugin;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const TokenMemberDelegationStats: React.FC<
    ITokenMemberDelegationStatsProps
> = (props) => {
    const { plugin, daoId } = props;

    return (
        <Card className="p-6">
            DelegationStatsCard for {daoId} and {plugin.address}
        </Card>
    );
};
