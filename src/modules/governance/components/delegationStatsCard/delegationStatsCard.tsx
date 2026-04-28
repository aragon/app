'use client';

import { Card } from '@aragon/gov-ui-kit';
import type { IDaoPlugin } from '@/shared/api/daoService';

export interface IDelegationStatsCardProps {
    /**
     * DAO plugin to display the delegation section for.
     */
    plugin: IDaoPlugin;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const DelegationStatsCard: React.FC<IDelegationStatsCardProps> = (
    props,
) => {
    const { plugin, daoId } = props;

    return (
        <Card className="p-6">
            DelegationStatsCard module for {daoId} and {plugin.address}
        </Card>
    );
};
