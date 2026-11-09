'use client';

import { Button, Card, Icon, IconType } from '@aragon/gov-ui-kit';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NetBackground from '@/assets/images/net_bg.svg';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { AragonLogo } from '@/shared/components/aragonLogo';
import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';

const privacyUrl = 'https://aragon.org/privacy-policy';
const termsUrl = 'https://aragon.org/terms-and-conditions';

export const LandingPage: React.FC = () => {
    const { t } = useTranslations();
    const router = useRouter();
    const { check: checkWalletConnection } = useConnectedWalletGuard({
        onSuccess: () => router.push('/workspace'),
    });
    const year = new Date().getFullYear();

    const findAccountLink = (
        <Link
            className="flex items-center gap-1.5 rounded-md text-sm leading-tight md:text-base"
            href="/explore"
        >
            <Icon icon={IconType.SEARCH} size="sm" />
            {t('app.application.landingPage.findAccount')}
        </Link>
    );

    const demoLink = (
        <div className="flex flex-col gap-1">
            <Link
                className="flex items-center gap-1 rounded-md text-base leading-tight"
                href="/demo"
            >
                {t('app.application.landingPage.demo.action')}
                <Icon icon={IconType.CHEVRON_RIGHT} size="sm" />
            </Link>
            <p className="text-sm leading-tight">
                {t('app.application.landingPage.demo.description')}
            </p>
        </div>
    );

    const legalLinks = (
        <div className="flex items-center gap-3 text-sm leading-tight">
            <p>{t('app.application.landingPage.copyright', { year })}</p>
            <Link href={privacyUrl} target="_blank">
                {t('app.application.landingPage.privacy')}
            </Link>
            <Link href={termsUrl} target="_blank">
                {t('app.application.landingPage.terms')}
            </Link>
        </div>
    );

    return (
        <main
            className="grid min-h-dvh bg-neutral-0 md:grid-cols-2"
            data-ftue-landing=""
        >
            <section className="relative flex min-h-80 flex-col overflow-hidden bg-primary-400 px-8 py-7 text-neutral-0 md:min-h-dvh md:px-12 md:py-10 lg:px-20">
                <Image
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 size-full object-cover opacity-30"
                    priority={true}
                    src={NetBackground as string}
                />
                <div className="relative flex items-center justify-between md:block">
                    <AragonLogo size="lg" variant="white" />
                    <div className="text-primary-50 md:hidden">
                        {findAccountLink}
                    </div>
                </div>
                <div className="relative mt-12 flex max-w-[520px] flex-col gap-3 md:my-auto md:gap-4">
                    <h1 className="font-normal text-4xl leading-tight md:text-5xl">
                        {t('app.application.landingPage.hero.title')}
                    </h1>
                    <p className="text-lg text-primary-50 leading-normal md:text-xl">
                        {t('app.application.landingPage.hero.description')}
                    </p>
                    <div className="mt-3 hidden md:block">{demoLink}</div>
                </div>
                <footer className="relative hidden text-primary-50 md:block">
                    {legalLinks}
                </footer>
            </section>

            <section className="flex min-h-[528px] flex-col px-5 py-12 text-neutral-800 md:min-h-dvh md:px-12 md:py-10 lg:px-20">
                <div className="hidden justify-end text-neutral-500 md:flex">
                    {findAccountLink}
                </div>
                <div className="flex grow items-center justify-center py-8 md:py-0">
                    <Card className="flex w-full max-w-[376px] flex-col gap-6 p-5 md:p-6">
                        <div className="flex flex-col gap-1">
                            <h2 className="font-semibold text-xl leading-tight">
                                {t('app.application.landingPage.signIn.title')}
                            </h2>
                            <p className="text-neutral-500 text-sm leading-normal">
                                {t(
                                    'app.application.landingPage.signIn.description',
                                )}
                            </p>
                        </div>
                        <Button
                            className="w-full"
                            iconLeft={IconType.BLOCKCHAIN_WALLET}
                            onClick={() => checkWalletConnection()}
                            size="lg"
                            type="button"
                        >
                            {t(
                                'app.application.landingPage.signIn.walletAction',
                            )}
                        </Button>
                        <div className="flex items-center gap-3 text-neutral-500 text-sm">
                            <span className="h-px grow bg-neutral-100" />
                            {t('app.application.landingPage.signIn.comingSoon')}
                            <span className="h-px grow bg-neutral-100" />
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-neutral-500">
                            <button
                                className="flex cursor-not-allowed flex-col items-center gap-2"
                                disabled={true}
                                type="button"
                            >
                                <span className="flex size-12 items-center justify-center rounded-full border border-neutral-100">
                                    <Icon
                                        icon={IconType.SOCIAL_EMAIL}
                                        size="md"
                                    />
                                </span>
                                {t('app.application.landingPage.signIn.email')}
                            </button>
                            <button
                                className="flex cursor-not-allowed flex-col items-center gap-2"
                                disabled={true}
                                type="button"
                            >
                                <span className="flex size-12 items-center justify-center rounded-full border border-neutral-100 font-semibold">
                                    G
                                </span>
                                {t('app.application.landingPage.signIn.google')}
                            </button>
                            <button
                                className="flex cursor-not-allowed flex-col items-center gap-2"
                                disabled={true}
                                type="button"
                            >
                                <span className="flex size-12 items-center justify-center rounded-full border border-neutral-100">
                                    <Icon icon={IconType.PERSON} size="md" />
                                </span>
                                {t(
                                    'app.application.landingPage.signIn.passkey',
                                )}
                            </button>
                        </div>
                    </Card>
                </div>
                <div className="flex flex-col gap-20 md:hidden">
                    {demoLink}
                    <footer className="text-neutral-500">{legalLinks}</footer>
                </div>
            </section>
        </main>
    );
};
