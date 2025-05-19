'use client';

import { NavigationDaoHome } from '@/modules/application/components/navigations/navigationDao/navigationDaoHome';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import { type IDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Wallet } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Navigation, type INavigationContainerProps } from '../navigation';
import { navigationDaoLinks } from './navigationDaoLinks';

export interface INavigationDaoProps extends INavigationContainerProps {
    /**
     * DAO to display the data for.
     */
    dao: IDao;
}

export const NavigationDao: React.FC<INavigationDaoProps> = (props) => {
    const { dao, containerClasses, ...otherProps } = props;

    const { t } = useTranslations();
    const { address, isConnected } = useAccount();
    const { open } = useDialogContext();

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleWalletClick = () => {
        const dialog = isConnected ? ApplicationDialogId.USER : ApplicationDialogId.CONNECT_WALLET;
        open(dialog);
    };

    const links = navigationDaoLinks(dao);
    const excludeLabels = new Set([
        'app.application.navigationDao.link.dashboard',
        'app.application.navigationDao.link.settings',
    ]);

    const navLinks = links.filter((link) => !excludeLabels.has(link.label));

    const walletUser = address != null ? { address } : undefined;

    return (
        <Navigation.Container
            containerClasses={classNames('flex flex-col gap-2 py-3 md:py-5 lg:gap-3', containerClasses)}
            {...otherProps}
        >
            <div className="flex flex-row items-center justify-between gap-1">
                <NavigationDaoHome dao={dao} onClick={() => setIsDialogOpen(true)} />
                <Navigation.Links className="hidden lg:flex" links={navLinks} />
                <div className="flex flex-row items-center gap-x-2 lg:gap-x-3">
                    <Navigation.AppLinks dao={dao} />
                    <Wallet onClick={handleWalletClick} user={walletUser} showTextFrom="xl" />
                    <Navigation.Trigger className="md:hidden" onClick={() => setIsDialogOpen(true)} />
                </div>
            </div>
            <Navigation.Dialog
                links={links}
                dao={dao}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                hiddenTitle={t('app.application.navigationDao.a11y.title')}
                hiddenDescription={t('app.application.navigationDao.a11y.description')}
            />
        </Navigation.Container>
    );
};
