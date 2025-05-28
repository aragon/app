'use client';

import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import { type IDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    addressUtils,
    ChainEntityType,
    Clipboard,
    DaoAvatar,
    Link,
    useBlockExplorer,
    Wallet,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Navigation, type INavigationContainerProps } from '../navigation';
import { NavigationDaoHome } from './navigationDaoHome';
import { navigationDaoLinks } from './navigationDaoLinks';

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
    const { open } = useDialogContext();

    const dialogSubtitle = daoUtils.getDaoEns(dao) ?? addressUtils.truncateAddress(dao.address);

    const { buildEntityUrl } = useBlockExplorer();
    const addressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: dao.address,
        chainId: networkDefinitions[dao.network].id,
    });

    const daoAvatar = ipfsUtils.cidToSrc(dao.avatar);

    const handleWalletClick = () => {
        const dialog = isConnected ? ApplicationDialogId.USER : ApplicationDialogId.CONNECT_WALLET;
        open(dialog);
    };

    const walletUser = address != null ? { address } : undefined;

    return (
        <Navigation.Container
            containerClasses={classNames('flex flex-col gap-2 py-3 md:py-5 lg:gap-3', containerClasses)}
            {...otherProps}
        >
            <div className="flex items-center justify-between gap-1">
                <NavigationDaoHome dao={dao} onClick={() => setIsDialogOpen(true)} />
                <Navigation.Links className="hidden lg:flex" links={navigationDaoLinks(dao, true)} />
                <div className="flex items-center gap-x-2 lg:gap-x-3">
                    <Navigation.AppLinks dao={dao} />
                    <Wallet onClick={handleWalletClick} user={walletUser} />
                    <Navigation.Trigger className="md:hidden" onClick={() => setIsDialogOpen(true)} />
                </div>
            </div>
            <Navigation.Dialog
                links={navigationDaoLinks(dao, false)}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                hiddenTitle={t('app.application.navigationDao.a11y.title')}
                hiddenDescription={t('app.application.navigationDao.a11y.description')}
            >
                <div className="flex flex-col gap-3 px-8">
                    <DaoAvatar src={daoAvatar} name={dao.name} size="lg" responsiveSize={{ sm: 'xl' }} />
                    <div className="flex flex-col gap-1.5 leading-tight font-normal">
                        <p className="truncate text-lg text-neutral-800 sm:text-xl">{dao.name}</p>
                        <Clipboard copyValue={dao.address} className="w-full">
                            <Link
                                href={addressLink}
                                isExternal={true}
                                className="truncate text-sm text-neutral-500 sm:text-base"
                            >
                                {dialogSubtitle}
                            </Link>
                        </Clipboard>
                    </div>
                </div>
            </Navigation.Dialog>
        </Navigation.Container>
    );
};
