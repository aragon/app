'use client';

import { ApplicationDialog } from '@/modules/application/constants/moduleDialogs';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Button, IconType, Toggle, ToggleGroup, Wallet } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { mainnet } from 'viem/chains';
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

    const { address, isConnected } = useAccount();

    const [daoFilter, setDaoFilter] = useState<string | undefined>('all');

    const walletUser = address != null ? { address } : undefined;

    const daoListParams = daoFilter === 'all' ? initialParams : undefined;
    const daoListMemberParams =
        daoFilter === 'member' ? { urlParams: { address: address! }, queryParams: { sort: 'blockNumber' } } : undefined;

    const { open } = useDialogContext();

    const handleWalletClick = () => {
        const dialog = isConnected ? ApplicationDialog.USER : ApplicationDialog.CONNECT_WALLET;
        open(dialog);
    };

    return (
        <div className="flex grow flex-col gap-5">
            <div className="flex items-center justify-between">
                <div className="flex w-full items-center gap-x-2 md:gap-x-3">
                    <ToggleGroup isMultiSelect={false} onChange={setDaoFilter} value={daoFilter}>
                        <Toggle value="all" label="All DAOs" />
                        <Toggle value="member" label="Member" disabled={address == null} />
                    </ToggleGroup>
                </div>
                <div className="flex items-center gap-x-2 md:gap-x-3">
                    <Button
                        iconLeft={IconType.PLUS}
                        href="/create/dao"
                        className="!rounded-full"
                        variant="primary"
                        size="md"
                    >
                        DAO
                    </Button>
                    <Wallet className="self-end" user={walletUser} onClick={handleWalletClick} chainId={mainnet.id} />
                </div>
            </div>
            <DaoList initialParams={daoListParams} daoListByMemberParams={daoListMemberParams} />
        </div>
    );
};
