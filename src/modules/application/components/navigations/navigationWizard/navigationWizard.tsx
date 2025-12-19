'use client';

import { DaoAvatar, Icon, IconType, Wallet } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { Route } from 'next';
import { useAccount } from 'wagmi';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import type { IDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Link } from '@/shared/components/link';
import {
    type INavigationContainerProps,
    Navigation,
} from '@/shared/components/navigation';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { ITFuncOptions } from '@/shared/utils/translationsUtils';

export interface INavigationWizardProps extends INavigationContainerProps {
    /**
     * Key and parameters of the wizard name displayed on the navigation.
     */
    name: string | [string, ITFuncOptions];
    /**
     * DAO to display the data for.
     */
    dao?: IDao;
    /**
     * Exit path to redirect to when exiting the wizard.
     */
    exitPath: Route;
}

export const NavigationWizard: React.FC<INavigationWizardProps> = (props) => {
    const { name, dao, exitPath } = props;

    const { address, isConnected } = useAccount();
    const isMounted = useIsMounted();
    const effectiveIsConnected = isMounted && isConnected;
    const { t } = useTranslations();
    const { open } = useDialogContext();

    const handleWalletClick = () => {
        const dialog = effectiveIsConnected
            ? ApplicationDialogId.USER
            : ApplicationDialogId.CONNECT_WALLET;
        open(dialog);
    };

    const walletUser = isMounted && address != null ? { address } : undefined;
    const daoAvatar = ipfsUtils.cidToSrc(dao?.avatar);

    const linkClassName = classNames(
        'items-center gap-3 rounded-full border border-neutral-100 p-4 text-neutral-300 transition-all',
        'hover:border-neutral-200 active:bg-neutral-50 active:text-neutral-800 focus-ring-primary',
    );

    const wizardName = typeof name === 'string' ? t(name) : t(...name);

    return (
        <Navigation.Container containerClasses="flex flex-row items-center gap-x-6 justify-between py-5">
            <div className="flex min-w-0 grow items-center gap-x-3 md:gap-x-4">
                <Link className={linkClassName} href={exitPath}>
                    <Icon icon={IconType.CLOSE} size="md" />
                </Link>
                <div className="flex min-w-0 flex-col gap-y-0.5">
                    <p className="text-nowrap text-base text-neutral-800 leading-tight">
                        {wizardName}
                    </p>
                    {dao != null && (
                        <div className="flex items-center gap-x-2">
                            <p className="truncate text-nowrap text-neutral-500 text-sm leading-tight">
                                {dao.name}
                            </p>
                            <DaoAvatar
                                name={dao.name}
                                size="sm"
                                src={daoAvatar}
                            />
                        </div>
                    )}
                </div>
            </div>
            <Wallet onClick={handleWalletClick} user={walletUser} />
        </Navigation.Container>
    );
};
