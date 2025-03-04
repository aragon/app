'use client';

import { ApplicationDialog } from '@/modules/application/constants/moduleDialogs';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Button, IconType, Wallet } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Link from 'next/link';
import { mainnet } from 'viem/chains';
import { useAccount } from 'wagmi';
import { Logo } from '../../pages/exploreDaosPage/logo';
import { Logotype } from '../../pages/exploreDaosPage/logotype';

const gradient = 'bg-gradient-to-b from-primary-400 to-transparent';

export const ExploreNav: React.FC = () => {
    const { address, isConnected } = useAccount();
    const walletUser = address != null ? { address } : undefined;
    const { open } = useDialogContext();

    const handleWalletClick = () => {
        const dialog = isConnected ? ApplicationDialog.USER : ApplicationDialog.CONNECT_WALLET;
        open(dialog);
    };

    const handleLegacyAppClick = () => {
        window.open('https://app.aragon.org/', '_blank');
    };

    return (
        <div className={classNames('sticky top-0 z-[var(--app-navbar-z-index)] w-full', gradient)}>
            <header className="mx-auto flex max-w-screen-xl items-center justify-between gap-6 self-stretch px-4 py-3 xl:gap-12 xl:px-6 xl:py-5">
                {/*Left - Logo*/}
                <div className="h-10">
                    <Link href="/">
                        <Logo className="block md:hidden" />
                        <Logotype className="hidden md:block" />
                    </Link>
                </div>

                {/*Right - Navigation Group*/}
                <nav className="flex items-center justify-end gap-4 xl:gap-6">
                    <Button
                        variant="secondary"
                        iconRight={IconType.LINK_EXTERNAL}
                        onClick={handleLegacyAppClick}
                        size="sm"
                        responsiveSize={{ lg: 'md' }}
                    >
                        Legacy app
                    </Button>
                    <Wallet onClick={handleWalletClick} user={walletUser} chainId={mainnet.id} />
                </nav>
            </header>
        </div>
    );
};
