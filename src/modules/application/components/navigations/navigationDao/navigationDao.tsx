'use client';

import { addressUtils, ChainEntityType, Clipboard, DaoAvatar, Link, Wallet } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import type { IDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { type INavigationContainerProps, Navigation } from '@/shared/components/navigation';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { NavigationDaoHome } from './navigationDaoHome';
import { navigationDaoUtils } from './navigationDaoUtils';

export interface INavigationDaoProps extends INavigationContainerProps {
    /**
     * DAO to display the data for.
     */
    dao: IDao;
}

export const NavigationDao: React.FC<INavigationDaoProps> = (props) => {
    const { dao, containerClasses, ...otherProps } = props;

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { t } = useTranslations();
    const { address, isConnected } = useAccount();
    const isMounted = useIsMounted();
    const effectiveIsConnected = isMounted && isConnected;
    const { open } = useDialogContext();

    const { buildEntityUrl } = useDaoChain({ network: dao.network });
    const addressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: dao.address,
    });

    const handleWalletClick = () => {
        const dialog = effectiveIsConnected ? ApplicationDialogId.USER : ApplicationDialogId.CONNECT_WALLET;
        open(dialog);
    };

    const walletUser = isMounted && address != null ? { address } : undefined;
    const daoAvatar = ipfsUtils.cidToSrc(dao.avatar);

    return (
        <Navigation.Container containerClasses={classNames('flex flex-col gap-2 py-3 md:py-5 lg:gap-3', containerClasses)} {...otherProps}>
            <div className="flex items-center justify-between gap-1">
                <NavigationDaoHome dao={dao} onClick={() => setIsDialogOpen(true)} />
                <Navigation.Links className="hidden lg:flex" links={navigationDaoUtils.buildLinks(dao, 'page')} />
                <div className="flex items-center gap-x-2 lg:gap-x-3">
                    <Wallet onClick={handleWalletClick} user={walletUser} />
                    <Navigation.Trigger className="md:hidden" onClick={() => setIsDialogOpen(true)} />
                </div>
            </div>
            <Navigation.Dialog
                hiddenDescription={t('app.application.navigationDao.a11y.description')}
                hiddenTitle={t('app.application.navigationDao.a11y.title')}
                links={navigationDaoUtils.buildLinks(dao, 'dialog')}
                onOpenChange={setIsDialogOpen}
                open={isDialogOpen}
            >
                <div className="flex flex-col gap-3 px-8">
                    <DaoAvatar name={dao.name} responsiveSize={{ sm: 'xl' }} size="lg" src={daoAvatar} />
                    <div className="flex flex-col gap-1.5 font-normal leading-tight">
                        <p className="truncate text-lg text-neutral-800 sm:text-xl">{dao.name}</p>
                        <Clipboard className="w-full" copyValue={dao.address}>
                            <Link className="truncate text-neutral-500 text-sm sm:text-base" href={addressLink} isExternal={true}>
                                {addressUtils.truncateAddress(dao.address)}
                            </Link>
                        </Clipboard>
                    </div>
                </div>
            </Navigation.Dialog>
        </Navigation.Container>
    );
};
