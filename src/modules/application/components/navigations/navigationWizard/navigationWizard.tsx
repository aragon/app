'use client';

import { ApplicationDialog } from '@/modules/application/constants/moduleDialogs';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { ITFuncOptions } from '@/shared/utils/translationsUtils';
import { DaoAvatar, Icon, IconType, Wallet } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { type Route } from 'next';
import { mainnet } from 'viem/chains';
import { useAccount } from 'wagmi';
import { Navigation, type INavigationContainerProps } from '../navigation';

export interface INavigationWizardProps extends INavigationContainerProps {
    /**
     * Key and parameters of the wizard name displayed on the navigation.
     */
    name: string | [string, ITFuncOptions];
    /**
     * ID of the DAO to display the data for.
     */
    id?: string;
    /**
     * Exit path to redirect to when exiting the wizard.
     */
    exitPath: Route;
}

export const NavigationWizard: React.FC<INavigationWizardProps> = (props) => {
    const { name, id, exitPath } = props;

    const { address, isConnected } = useAccount();
    const { t } = useTranslations();
    const { open } = useDialogContext();

    const handleWalletClick = () => {
        const dialog = isConnected ? ApplicationDialog.USER : ApplicationDialog.CONNECT_WALLET;
        open(dialog);
    };

    const daoParams = { id: id! };
    const { data: dao } = useDao({ urlParams: daoParams }, { enabled: id != null });

    const walletUser = address != null ? { address } : undefined;
    const daoAvatar = ipfsUtils.cidToSrc(dao?.avatar);

    const linkClassName = classNames(
        'items-center gap-3 rounded-full border border-neutral-100 p-4 text-neutral-300 transition-all',
        'hover:border-neutral-200 active:bg-neutral-50 active:text-neutral-800',
        'focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-offset',
    );

    const wizardName = typeof name === 'string' ? t(name) : t(...name);

    return (
        <Navigation.Container containerClasses="flex flex-row items-center gap-x-6 justify-between py-5">
            <div className="flex min-w-0 grow items-center gap-x-3 md:gap-x-4">
                <Link href={exitPath} className={linkClassName}>
                    <Icon icon={IconType.CLOSE} size="md" />
                </Link>
                <div className="flex min-w-0 flex-col gap-y-0.5">
                    <p className="text-nowrap text-base leading-tight text-neutral-800">{wizardName}</p>
                    {dao != null && (
                        <div className="flex items-center gap-x-2">
                            <p className="truncate text-nowrap text-sm leading-tight text-neutral-500">{dao.name}</p>
                            <DaoAvatar name={dao.name} src={daoAvatar} size="sm" />
                        </div>
                    )}
                </div>
            </div>
            <Wallet onClick={handleWalletClick} user={walletUser} chainId={mainnet.id} />
        </Navigation.Container>
    );
};
