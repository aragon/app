'use client';

import { DaoAvatar, Wallet } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Link from 'next/link';
import { useConnection } from 'wagmi';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';

export interface IFlowTopbarProps {
    daoId: string;
    network: string;
    addressOrEns: string;
    className?: string;
}

export const FlowTopbar: React.FC<IFlowTopbarProps> = (props) => {
    const { daoId, network, addressOrEns, className } = props;

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { address, isConnected } = useConnection();
    const isMounted = useIsMounted();
    const effectiveIsConnected = isMounted && isConnected;
    const { open } = useDialogContext();

    const daoDisplayName = dao != null ? daoUtils.getDaoDisplayName(dao) : '';
    const daoAvatar =
        dao?.avatar != null ? ipfsUtils.cidToSrc(dao.avatar) : undefined;
    const walletUser = isMounted && address != null ? { address } : undefined;

    const handleWalletClick = () => {
        const dialog = effectiveIsConnected
            ? ApplicationDialogId.USER
            : ApplicationDialogId.CONNECT_WALLET;
        open(dialog);
    };

    return (
        <header
            className={classNames(
                'border-neutral-100 border-b bg-neutral-0',
                className,
            )}
        >
            <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-3 md:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <Link
                        className="flex items-center gap-2 text-primary-400 hover:text-primary-600"
                        href={`/dao/${network}/${addressOrEns}/flow`}
                    >
                        <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary-400 font-semibold text-neutral-0 text-sm leading-none">
                            F
                        </span>
                        <span className="font-semibold text-base text-neutral-800 leading-none">
                            Flow
                        </span>
                    </Link>
                    <span className="text-neutral-200">/</span>
                    <Link
                        className="flex min-w-0 items-center gap-2 text-neutral-800 hover:text-primary-400"
                        href={`/dao/${network}/${addressOrEns}`}
                    >
                        <DaoAvatar
                            name={daoDisplayName}
                            size="sm"
                            src={daoAvatar}
                        />
                        <span className="truncate font-normal text-base leading-none">
                            {daoDisplayName || addressOrEns}
                        </span>
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <Wallet onClick={handleWalletClick} user={walletUser} />
                </div>
            </div>
        </header>
    );
};
