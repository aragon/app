'use client';

import { Toggle, ToggleGroup } from '@aragon/ods';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import type { IGetDaoListParams } from '../../api/daoExplorerService';
import { DaoList } from '../../components/daoList';

export interface IExploreDaosPageClientProps {
    /**
     * Initial parameters to use to fetch the list of DAOs.
     */
    initialParams: IGetDaoListParams;
}

export const ExploreDaosPageClient: React.FC<IExploreDaosPageClientProps> = (props) => {
    const { initialParams } = props;

    const { address } = useAccount();

    const [daoFilter, setDaoFilter] = useState<string | undefined>('all');

    const daoListParams = daoFilter === 'all' ? initialParams : undefined;
    const daoListMemberParams =
        daoFilter === 'member' ? { urlParams: { address: address! }, queryParams: {} } : undefined;

    return (
        <div className="flex grow flex-col gap-5">
            <ToggleGroup isMultiSelect={false} onChange={setDaoFilter} value={daoFilter}>
                <Toggle value="all" label="All DAOs" />
                <Toggle value="member" label="Member" disabled={address == null} />
            </ToggleGroup>
            <DaoList initialParams={daoListParams} daoListByMemberParams={daoListMemberParams} />
        </div>
    );
};
