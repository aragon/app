'use client';

import { Wallet } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import { AragonLogo } from '@/shared/components/aragonLogo';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Navigation } from '@/shared/components/navigation';
import { useIsMounted } from '@/shared/hooks/useIsMounted';

export const ExploreNav: React.FC = () => {
    const { address, isConnected } = useAccount();
    const isMounted = useIsMounted();
    const effectiveIsConnected = isMounted && isConnected;
    const walletUser = isMounted && address != null ? { address } : undefined;
    const { open } = useDialogContext();

    const [isPostHero, setIsPostHero] = useState(false);

    useEffect(() => {
        // TODO: check if IntersectionObserver can be used instead as a more performant solution (APP-4042)
        const checkScrollPosition = () => {
            // Find the hero element by its id
            const heroElement = document.querySelector('#explore-page-hero');
            if (heroElement) {
                const heroRect = heroElement.getBoundingClientRect();

                // Consider navbar height (72px) plus small margin to avoid flickering
                setIsPostHero(heroRect.bottom <= 90);
            }
        };

        // Initial check
        checkScrollPosition();

        window.addEventListener('scroll', checkScrollPosition);

        return () => window.removeEventListener('scroll', checkScrollPosition);
    }, []);

    const handleWalletClick = () => {
        const dialog = effectiveIsConnected ? ApplicationDialogId.USER : ApplicationDialogId.CONNECT_WALLET;
        open(dialog);
    };

    return (
        <Navigation.Container
            className={classNames(
                'border-b-0',
                isPostHero ? 'bg-primary-400' : 'bg-gradient-to-b bg-transparent from-primary-400 to-transparent'
            )}
            containerClasses={classNames('flex items-center justify-between gap-6 px-4 py-3 lg:gap-12 lg:px-6 lg:py-5')}
        >
            <div className="h-10">
                <Link href="/">
                    <AragonLogo responsiveIconOnly={true} size="lg" variant="white" />
                </Link>
            </div>

            <div className="flex items-center justify-end gap-4 lg:gap-6">
                <Wallet onClick={handleWalletClick} user={walletUser} />
            </div>
        </Navigation.Container>
    );
};
