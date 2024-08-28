'use client';

import { ApplicationDialog } from '@/modules/application/constants/moduleDialogs';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { DaoAvatar, Icon, IconType, Wallet } from '@aragon/ods';
import classNames from 'classnames';
import { useRouter } from 'next/navigation';
import { mainnet } from 'viem/chains';
import { useAccount } from 'wagmi';
import { Navigation, type INavigationContainerProps } from '../navigation';

export interface INavigationWizardProps extends INavigationContainerProps {
    /**
     * Name of the wizard to display.
     */
    name: string;
    /**
     * ID of the DAO to display the data for.
     */
    id?: string;
}

export const NavigationWizard: React.FC<INavigationWizardProps> = (props) => {
    const { name, id } = props;

    const { address, isConnected } = useAccount();

    const router = useRouter();

    const { open } = useDialogContext();

    const handleWalletClick = () => {
        const dialog = isConnected ? ApplicationDialog.USER : ApplicationDialog.CONNECT_WALLET;
        open(dialog);
    };

    const walletUser = address != null ? { address } : undefined;

    const { data: dao } = useDao({ urlParams: { id: id ?? '' } }, { enabled: id != null });

    const daoAvatar = ipfsUtils.cidToSrc(dao?.avatar);

    const buttonClassName = classNames(
        'items-center gap-3 rounded-full border border-neutral-100 p-4 text-neutral-300 transition-all',
        'hover:border-neutral-200 active:bg-neutral-50 active:text-neutral-800',
        'focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-offset',
    );

    return (
        <Navigation.Container containerClasses="flex flex-row items-center gap-x-6 justify-between py-5">
            <div className="flex grow items-center gap-x-3 md:gap-x-4">
                <button onClick={router.back} className={buttonClassName}>
                    <Icon icon={IconType.CLOSE} size="md" />
                </button>
                <div className="flex grow flex-col gap-y-0.5">
                    <p className="text-nowrap text-base leading-tight text-neutral-800">{name}</p>

                    {dao != null && (
                        <div className="flex items-center gap-x-2">
                            <p className="truncate text-nowrap text-sm leading-tight text-neutral-500">{dao?.name}</p>
                            <DaoAvatar name={dao?.name} src={daoAvatar} size="sm" />
                        </div>
                    )}
                </div>
            </div>
            <Wallet onClick={handleWalletClick} user={walletUser} chainId={mainnet.id} />
        </Navigation.Container>
    );
};
