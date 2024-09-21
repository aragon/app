'use client';

import { ApplicationDialog } from '@/modules/application/constants/moduleDialogs';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { Button, DaoAvatar, IconType, Wallet, addressUtils, clipboardUtils } from '@aragon/ods';
import classNames from 'classnames';
import { useState } from 'react';
import { mainnet } from 'viem/chains';
import { useAccount } from 'wagmi';
import { Navigation, type INavigationContainerProps } from '../navigation';
import { navigationDaoLinks } from './navigationDaoLinks';

export interface INavigationDaoProps extends INavigationContainerProps {
    /**
     * ID of the DAO to display the data for.
     */
    id: string;
}

export const NavigationDao: React.FC<INavigationDaoProps> = (props) => {
    const { id, containerClasses, ...otherProps } = props;

    const { address, isConnected } = useAccount();
    const { open } = useDialogContext();

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const urlParams = { id };
    const { data: dao } = useDao({ urlParams });

    const handleCopyClick = () => clipboardUtils.copy(dao!.address);

    const handleWalletClick = () => {
        const dialog = isConnected ? ApplicationDialog.USER : ApplicationDialog.CONNECT_WALLET;
        open(dialog);
    };

    const daoAvatar = ipfsUtils.cidToSrc(dao?.avatar);
    const links = navigationDaoLinks(dao);
    const dialogSubtitle = daoUtils.getDaoEns(dao) ?? addressUtils.truncateAddress(dao?.address);

    const walletUser = address != null ? { address } : undefined;

    return (
        <Navigation.Container
            containerClasses={classNames('flex flex-col gap-2 py-3 md:pb-0 md:pt-5 lg:gap-3', containerClasses)}
            {...otherProps}
        >
            <div className="flex flex-row justify-between gap-1">
                <button className="flex min-w-0 flex-row items-center gap-3 p-1">
                    <DaoAvatar src={daoAvatar} name={dao?.name} size="lg" />
                    <p className="hidden truncate text-base font-normal leading-tight text-neutral-800 md:block">
                        {dao?.name}
                    </p>
                </button>
                <div className="flex flex-row gap-2">
                    <Wallet onClick={handleWalletClick} user={walletUser} chainId={mainnet.id} />
                    <Navigation.Trigger className="md:hidden" onClick={() => setIsDialogOpen(true)} />
                </div>
            </div>
            <Navigation.Links className="hidden md:flex xl:pl-14" links={links} variant="columns" />
            <Navigation.Dialog links={links} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <div className="flex flex-col gap-4 px-4">
                    <div className="flex grow flex-row justify-between">
                        <DaoAvatar src={daoAvatar} name={dao?.name} size="md" responsiveSize={{ sm: 'lg' }} />
                        <div className="flex flex-row gap-3">
                            <Button
                                variant="tertiary"
                                size="sm"
                                responsiveSize={{ sm: 'md' }}
                                iconLeft={IconType.COPY}
                                onClick={handleCopyClick}
                            />
                            <Button
                                variant="tertiary"
                                size="sm"
                                responsiveSize={{ sm: 'md' }}
                                iconLeft={IconType.APP_EXPLORE}
                                href="/"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5 font-normal leading-tight">
                        <p className="truncate text-lg text-neutral-800 sm:text-xl">{dao?.name}</p>
                        <p className="truncate text-sm text-neutral-500 sm:text-base">{dialogSubtitle}</p>
                    </div>
                </div>
            </Navigation.Dialog>
        </Navigation.Container>
    );
};
