'use client';

import { ApplicationDialog } from '@/modules/application/constants/moduleDialogs';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Image } from '@/shared/components/image';
import { IconType, Wallet } from '@aragon/gov-ui-kit';
import { Button } from '@aragon/gov-ui-kit-original';
import classNames from 'classnames';
import { mainnet } from 'viem/chains';
import { useAccount } from 'wagmi';
import AragonAppLogo from './logotype.svg';

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
        <div className="sticky top-0 z-[var(--app-navbar-z-index)] w-full">
            <nav className={classNames('flex flex-col items-center gap-0 p-0', gradient)}>
                {/*Container*/}
                <div className="flex max-w-screen-xl items-center gap-6 self-stretch px-4 py-3 xl:gap-12 xl:px-6 xl:py-5">
                    {/*Wrapper*/}
                    <div className="flex flex-1 items-center justify-between">
                        {/*Logo*/}
                        <div className="h-10">
                            <Image alt="Aragon App logo" className="h-10" fill={false} src={AragonAppLogo as string} />
                        </div>
                        {/*Navigation Group*/}
                        <div className="flex items-center justify-end gap-4 xl:gap-6">
                            <Button
                                variant="secondary"
                                iconRight={IconType.LINK_EXTERNAL}
                                onClick={handleLegacyAppClick}
                                size="sm"
                                responsiveSize={{ sm: 'md' }}
                            >
                                Legacy app
                            </Button>
                            <Wallet onClick={handleWalletClick} user={walletUser} chainId={mainnet.id} />
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};
