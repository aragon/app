'use client';

import { Button, Icon, IconType, Spinner } from '@aragon/gov-ui-kit';
import { useAppKit } from '@reown/appkit/react';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import GoogleIcon from '@/assets/images/google.svg';
import NetBackground from '@/assets/images/net_bg.svg';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useWalletConnected } from '@/modules/application/hooks/useWalletConnected';
import {
    workspaceService,
    workspaceServiceKeys,
} from '@/modules/workspace/api/workspaceService';
import workspaceDemoFixture from '@/modules/workspace/fixtures/workspaceDemo.fixture.json';
import {
    workspaceAllAccountsSegment,
    workspaceUtils,
} from '@/modules/workspace/utils/workspaceUtils';
import { AragonLogo } from '@/shared/components/aragonLogo';
import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';

const privacyUrl = 'https://aragon.org/privacy-policy';
const termsUrl = 'https://aragon.org/terms-and-conditions';
const demoWorkspaceUrl = workspaceUtils.getAccountScopeUrl(
    'aragon-demo',
    workspaceAllAccountsSegment,
    'overview',
);

export const LandingPage: React.FC = () => {
    const { t } = useTranslations();
    const router = useRouter();
    const queryClient = useQueryClient();
    // FTUE signs in straight from the AppKit modal, without the intermediate
    // Aragon connect dialog; the effect below routes on connection.
    const { open: openWeb3Modal } = useAppKit();
    const isWalletConnected = useWalletConnected();
    const year = new Date().getFullYear();
    const { address, isConnecting } = useWalletAccount();

    useEffect(() => {
        if (isWalletConnected) {
            router.replace('/workspace');
        }
    }, [isWalletConnected, router]);
    const isOpeningWorkspace =
        isWalletConnected || address != null || isConnecting;

    if (isOpeningWorkspace) {
        return (
            <main
                aria-busy="true"
                className="flex min-h-dvh items-center justify-center bg-neutral-0"
                data-ftue-landing=""
            >
                <div
                    className="flex flex-col items-center gap-related text-neutral-500"
                    role="status"
                >
                    <Spinner size="lg" variant="neutral" />
                    <p className="text-base leading-tight">
                        {t('app.application.landingPage.openingWorkspace')}
                    </p>
                </div>
            </main>
        );
    }

    const legalLinks = (
        <nav
            aria-label={t('app.application.landingPage.legal')}
            className="flex items-center gap-related text-sm leading-tight"
        >
            <span>{t('app.application.landingPage.copyright', { year })}</span>
            <Link href={privacyUrl} target="_blank">
                {t('app.application.landingPage.privacy')}
            </Link>
            <Link href={termsUrl} target="_blank">
                {t('app.application.landingPage.terms')}
            </Link>
        </nav>
    );

    const handleOpenDemo = async (
        event: React.MouseEvent<HTMLAnchorElement>,
    ) => {
        event.preventDefault();
        await workspaceService.activateSessionWorkspaceRegistry(
            JSON.stringify(workspaceDemoFixture),
        );
        queryClient.removeQueries({
            queryKey: workspaceServiceKeys.workspaceList(),
        });
        Object.keys(workspaceDemoFixture).forEach((id) =>
            queryClient.removeQueries({
                queryKey: workspaceServiceKeys.workspace({
                    urlParams: { id },
                }),
            }),
        );
        router.push(demoWorkspaceUrl);
    };

    const demoLink = (
        <Link
            className="relative inline-flex h-control-lg items-center justify-center gap-control-lg--fixed-8 rounded-xl border border-neutral-0/55 px-control-lg--fixed-20 text-base whitespace-nowrap text-neutral-0 transition-colors hover:border-neutral-0 hover:bg-neutral-0/10"
            href={demoWorkspaceUrl}
            onClick={handleOpenDemo}
        >
            {t('app.application.landingPage.demo.action')}
            <Icon icon={IconType.CHEVRON_RIGHT} size="sm" />
        </Link>
    );

    return (
        <main
            className="grid min-h-dvh grid-rows-[auto_auto] overflow-x-hidden bg-neutral-0 text-neutral-800 md:h-dvh md:grid-cols-2 md:grid-rows-1 md:overflow-hidden"
            data-ftue-landing=""
        >
            <section className="flex flex-col items-center gap-section px-6 pt-6 pb-5 text-center md:items-stretch md:justify-between md:px-12 md:py-12 md:text-left xl:px-[72px]">
                <AragonLogo size="md" />

                <div className="flex w-full max-w-[560px] flex-col items-center gap-section--24-32 md:items-start">
                    <div className="flex flex-col items-center gap-related md:items-start">
                        <h1 className="text-[clamp(1.25rem,7vw,1.75rem)] leading-[1.2] font-normal tracking-[-0.01em] text-balance md:text-[clamp(1.25rem,calc(3.7vw-7.5px),2.5rem)] xl:text-[clamp(1.25rem,calc(3.7vw-11px),2.5rem)]">
                            {t('app.application.landingPage.hero.title')}
                        </h1>
                        <p className="text-base leading-normal text-pretty text-neutral-500">
                            {t('app.application.landingPage.hero.description')}
                        </p>
                    </div>

                    <div className="flex w-full max-w-[400px] flex-col gap-related">
                        <Button
                            className="w-full"
                            iconLeft={IconType.BLOCKCHAIN_WALLET}
                            onClick={() =>
                                void openWeb3Modal({ view: 'Connect' })
                            }
                            size="lg"
                            type="button"
                        >
                            {t(
                                'app.application.landingPage.signIn.walletAction',
                            )}
                        </Button>
                        <div className="mt-related--fixed-8 flex items-center gap-related text-sm leading-tight text-neutral-500">
                            <span className="h-px grow bg-neutral-100" />
                            {t('app.application.landingPage.signIn.comingSoon')}
                            <span className="h-px grow bg-neutral-100" />
                        </div>
                        <div className="flex justify-center gap-section-wide--32-40 text-neutral-500">
                            <button
                                className="flex w-20 flex-col items-center gap-related--fixed-8 rounded-xl py-inset-tight--fixed-8 text-sm leading-tight"
                                disabled={true}
                                type="button"
                            >
                                <span className="flex size-12 items-center justify-center rounded-full border border-neutral-100 bg-neutral-0 text-neutral-400">
                                    <Icon
                                        icon={IconType.SOCIAL_EMAIL}
                                        size="md"
                                    />
                                </span>
                                {t('app.application.landingPage.signIn.email')}
                            </button>
                            <button
                                className="flex w-20 flex-col items-center gap-related--fixed-8 rounded-xl py-inset-tight--fixed-8 text-sm leading-tight"
                                disabled={true}
                                type="button"
                            >
                                <span className="flex size-12 items-center justify-center rounded-full border border-neutral-100 bg-neutral-0">
                                    <Image
                                        alt=""
                                        className="opacity-55 grayscale"
                                        height={16}
                                        src={GoogleIcon}
                                        width={16}
                                    />
                                </span>
                                {t('app.application.landingPage.signIn.google')}
                            </button>
                            <button
                                className="flex w-20 flex-col items-center gap-related--fixed-8 rounded-xl py-inset-tight--fixed-8 text-sm leading-tight"
                                disabled={true}
                                type="button"
                            >
                                <span className="flex size-12 items-center justify-center rounded-full border border-neutral-100 bg-neutral-0 text-neutral-400">
                                    <Icon icon={IconType.PERSON} size="md" />
                                </span>
                                {t(
                                    'app.application.landingPage.signIn.passkey',
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <footer className="hidden text-neutral-500 md:block">
                    {legalLinks}
                </footer>
            </section>

            <section className="relative flex flex-col items-center justify-start gap-section overflow-hidden bg-primary-400 px-6 pt-6 md:min-h-0 md:items-start md:justify-center md:px-0 md:pt-0 md:pl-12 xl:pl-[72px]">
                <Image
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 size-full object-cover opacity-30"
                    priority={true}
                    src={NetBackground as string}
                />
                <Link
                    aria-label={t(
                        'app.application.landingPage.demo.previewLabel',
                    )}
                    className="relative hidden aspect-[16/10] h-[64%] shrink-0 overflow-hidden rounded-l-xl bg-neutral-50 shadow-[0_24px_64px_-20px_rgba(10,28,92,0.55)] ring-1 ring-neutral-0/35 md:block"
                    href={demoWorkspaceUrl}
                    onClick={handleOpenDemo}
                >
                    <Image
                        alt={t(
                            'app.application.landingPage.demo.desktopPreviewAlt',
                        )}
                        className="object-cover object-left-top"
                        fill={true}
                        priority={true}
                        sizes="80vw"
                        src="/landing/workspace-preview-desktop.jpg"
                    />
                </Link>
                <Link
                    aria-label={t(
                        'app.application.landingPage.demo.previewLabel',
                    )}
                    className="relative block w-full max-w-[300px] overflow-hidden rounded-t-xl bg-neutral-50 shadow-[0_24px_64px_-20px_rgba(10,28,92,0.55)] ring-1 ring-neutral-0/35 md:hidden"
                    href={demoWorkspaceUrl}
                    onClick={handleOpenDemo}
                >
                    <Image
                        alt={t(
                            'app.application.landingPage.demo.mobilePreviewAlt',
                        )}
                        className="h-auto w-full"
                        height={1540}
                        src="/landing/workspace-preview-mobile.jpg"
                        width={780}
                    />
                </Link>
                <div className="relative order-first md:order-none">
                    {demoLink}
                </div>
            </section>
        </main>
    );
};
