'use client';

import { ApplicationDialog } from '@/modules/application/constants/moduleDialogs';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType, Wallet } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { mainnet } from 'viem/chains';
import { useAccount } from 'wagmi';
import AragonLogo from './icons/logo.svg';
import AragonLogotype from './icons/logotype.svg';

const gradientBg = 'bg-gradient-to-b from-primary-400 to-transparent';
const solidBg = 'bg-primary-400';

export const ExploreNav: React.FC = () => {
    const { address, isConnected } = useAccount();
    const walletUser = address != null ? { address } : undefined;
    const { open } = useDialogContext();
    const { t } = useTranslations();

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
        const dialog = isConnected ? ApplicationDialog.USER : ApplicationDialog.CONNECT_WALLET;
        open(dialog);
    };

    return (
        <div
            className={classNames(
                'sticky top-0 z-[var(--app-explore-navbar-z-index)] w-full',
                isPostHero ? solidBg : gradientBg,
            )}
        >
            <header className="mx-auto flex max-w-screen-xl items-center justify-between gap-6 self-stretch px-4 py-3 xl:gap-12 xl:px-6 xl:py-5">
                <div className="h-10">
                    <Link href="/">
                        <Image
                            src={AragonLogo as string}
                            alt="Aragon logo"
                            className="block min-w-10 md:hidden"
                            priority={true}
                        />
                        <Image
                            src={AragonLogotype as string}
                            alt="Aragon logo"
                            className="hidden md:block"
                            priority={true}
                        />
                        {/*<Logo className="block md:hidden" />*/}
                        {/*<Logotype className="hidden md:block" />*/}
                    </Link>
                </div>

                <nav className="flex items-center justify-end gap-4 xl:gap-6">
                    <Button
                        variant="tertiary"
                        iconRight={IconType.LINK_EXTERNAL}
                        href="https://app.aragon.org/"
                        target="_blank"
                        size="sm"
                        responsiveSize={{ lg: 'md' }}
                    >
                        {t('app.explore.exploreNav.legacyAppButtonLabel')}
                    </Button>
                    <Wallet onClick={handleWalletClick} user={walletUser} chainId={mainnet.id} />
                </nav>
            </header>
        </div>
    );
};
