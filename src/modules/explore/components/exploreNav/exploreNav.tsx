'use client';

import { ApplicationDialog } from '@/modules/application/constants/moduleDialogs';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Button, IconType, Wallet } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { mainnet } from 'viem/chains';
import { useAccount } from 'wagmi';
import { Logo } from './logo';
import { Logotype } from './logotype';

const gradientBg = 'bg-gradient-to-b from-primary-400 to-transparent';
const solidBg = 'bg-primary-400';

export const ExploreNav: React.FC = () => {
    const { address, isConnected } = useAccount();
    const walletUser = address != null ? { address } : undefined;
    const { open } = useDialogContext();

    const [isPostHero, setIsPostHero] = useState(false);

    useEffect(() => {
        // TODO: check if IntersectionObserver can be used instead as a more performant solution
        const checkScrollPosition = () => {
            // Find the hero element by its id
            const heroElement = document.querySelector('#explore-page-hero');
            if (heroElement) {
                const heroRect = heroElement.getBoundingClientRect();
                // Consider navbar height (72px) plus small margin to avoid flickering
                setIsPostHero(heroRect.bottom <= 100);
            }
        };

        // Initial check
        checkScrollPosition();

        window.addEventListener('scroll', checkScrollPosition);

        return () => window.removeEventListener('scroll', checkScrollPosition);
    }, []);

    const handleWalletClick = () => {
        const dialog = isConnected ? ApplicationDialog.USER : ApplicationDialog.CONNECT_WALLET;
        open(dialog);
    };

    const handleLegacyAppClick = () => {
        window.open('https://app.aragon.org/', '_blank');
    };

    return (
        <div
            className={classNames(
                'sticky top-0 z-[var(--app-navbar-z-index)] w-full',
                isPostHero ? solidBg : gradientBg,
            )}
        >
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
                        variant="tertiary"
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
