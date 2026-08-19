'use client';

import { Button, IconType, Tag } from '@aragon/gov-ui-kit';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMpcLogout } from '@/modules/mpc/api/mpcService';
import {
    MPC_LIST_PATH,
    MPC_LOGIN_PATH,
} from '@/modules/mpc/constants/mpcConstants';
import { useMpcSessionGuard } from '@/modules/mpc/hooks/useMpcSessionGuard';
import { AragonLogo } from '@/shared/components/aragonLogo';
import { Navigation } from '@/shared/components/navigation';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcNavigationProps {}

/**
 * Navigation bar of the MPC systems POC pages: logo, section name, current mock user and logout.
 */
export const MpcNavigation: React.FC<IMpcNavigationProps> = () => {
    const { t } = useTranslations();
    const router = useRouter();
    const { session, isAuthenticated } = useMpcSessionGuard();
    const { mutate: logout, isPending } = useMpcLogout({
        onSuccess: () => router.push(MPC_LIST_PATH),
    });

    return (
        <Navigation.Container containerClasses="flex flex-row items-center justify-between gap-6 py-4">
            <div className="flex min-w-0 items-center gap-4">
                <Link href="/">
                    <AragonLogo responsiveIconOnly={true} size="md" />
                </Link>
                <Link
                    className="text-base text-neutral-800 leading-tight"
                    href={MPC_LIST_PATH}
                >
                    {t('app.mpc.mpcNavigation.title')}
                </Link>
                <Tag label={t('app.mpc.mpcNavigation.poc')} variant="warning" />
            </div>
            <div className="flex items-center gap-3">
                {isAuthenticated && session != null ? (
                    <>
                        <span className="hidden text-neutral-500 text-sm md:inline">
                            {t('app.mpc.mpcNavigation.signedInAs', {
                                user: session.user.username,
                            })}
                        </span>
                        <Button
                            iconLeft={IconType.LOGOUT}
                            isLoading={isPending}
                            onClick={() => logout()}
                            size="sm"
                            variant="tertiary"
                        >
                            {t('app.mpc.mpcNavigation.logout')}
                        </Button>
                    </>
                ) : (
                    <Button href={MPC_LOGIN_PATH} size="sm" variant="secondary">
                        {t('app.mpc.mpcNavigation.login')}
                    </Button>
                )}
            </div>
        </Navigation.Container>
    );
};
