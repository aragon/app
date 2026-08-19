'use client';

import { CardEmptyState, Spinner } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import { MPC_LOGIN_PATH } from '@/modules/mpc/constants/mpcConstants';
import { useMpcSessionGuard } from '@/modules/mpc/hooks/useMpcSessionGuard';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcAuthGateProps {
    /**
     * Content rendered when the user is authenticated.
     */
    children?: ReactNode;
    /**
     * Redirects to the login page (with a redirect back) instead of rendering the login CTA.
     */
    redirectTo?: string;
    /**
     * Classes applied to the wrapper of the loading / CTA states.
     */
    className?: string;
}

/**
 * Renders the children only when a mock session exists, otherwise a login CTA (or a redirect to /mpc/login).
 */
export const MpcAuthGate: React.FC<IMpcAuthGateProps> = (props) => {
    const { children, redirectTo, className } = props;
    const { t } = useTranslations();
    const router = useRouter();
    const { isLoading, isAuthenticated } = useMpcSessionGuard();

    const shouldRedirect = !isLoading && !isAuthenticated && redirectTo != null;
    const loginHref =
        redirectTo != null
            ? `${MPC_LOGIN_PATH}?redirect=${encodeURIComponent(redirectTo)}`
            : MPC_LOGIN_PATH;

    useEffect(() => {
        if (shouldRedirect) {
            router.replace(loginHref);
        }
    }, [shouldRedirect, loginHref, router]);

    if (isLoading || shouldRedirect) {
        return (
            <div className={classNames('flex justify-center py-20', className)}>
                <Spinner size="xl" variant="neutral" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className={className}>
                <CardEmptyState
                    description={t('app.mpc.mpcAuthGate.description')}
                    heading={t('app.mpc.mpcAuthGate.heading')}
                    objectIllustration={{ object: 'SECURITY' }}
                    primaryButton={{
                        label: t('app.mpc.mpcAuthGate.action'),
                        href: loginHref,
                    }}
                />
            </div>
        );
    }

    return <>{children}</>;
};
