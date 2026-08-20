'use client';

import { Wallet } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Link from 'next/link';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import { AragonLogo } from '@/shared/components/aragonLogo';
import { useDialogContext } from '@/shared/components/dialogProvider';
import {
    type INavigationContainerProps,
    Navigation,
} from '@/shared/components/navigation';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { useEnsName } from '../../../../ens';
import { useWalletAccount } from '../../../hooks/useWalletAccount';
import { useWalletConnected } from '../../../hooks/useWalletConnected';
import { SupportChatTrigger } from '../../supportChat';

export interface INavigationDefaultProps extends INavigationContainerProps {}

export const NavigationDefault: React.FC<INavigationDefaultProps> = (props) => {
    const { containerClasses, ...otherProps } = props;

    const { address } = useWalletAccount();
    const { data: displayName } = useEnsName(address, {
        stripAragonRegistrySuffix: true,
    });
    const isConnected = useWalletConnected();
    const isMounted = useIsMounted();
    const { open } = useDialogContext();

    const effectiveIsConnected = isMounted && isConnected && address != null;
    const walletUser =
        isMounted && address != null
            ? { address, name: displayName ?? undefined }
            : undefined;

    const handleWalletClick = () => {
        const dialog = effectiveIsConnected
            ? ApplicationDialogId.USER
            : ApplicationDialogId.CONNECT_WALLET;
        open(dialog);
    };

    return (
        <Navigation.Container
            containerClasses={classNames(
                'flex items-center justify-between gap-6 py-3 md:py-5 lg:gap-12',
                containerClasses,
            )}
            trailing={<SupportChatTrigger />}
            {...otherProps}
        >
            <div className="h-10">
                <Link href="/">
                    <AragonLogo responsiveIconOnly={true} size="lg" />
                </Link>
            </div>
            <Wallet onClick={handleWalletClick} user={walletUser} />
        </Navigation.Container>
    );
};
