'use client';

import { Card, Heading, Tabs } from '@aragon/gov-ui-kit';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import {
    MpcLoginForm,
    type MpcLoginFormMode,
} from '@/modules/mpc/components/mpcLoginForm';
import { MpcMockBanner } from '@/modules/mpc/components/mpcMockBanner';
import { MpcTotpEnrollment } from '@/modules/mpc/components/mpcTotpEnrollment';
import { MPC_LIST_PATH } from '@/modules/mpc/constants/mpcConstants';
import { useMpcSessionGuard } from '@/modules/mpc/hooks/useMpcSessionGuard';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcLoginPageClientProps {}

const modes: MpcLoginFormMode[] = ['login', 'register'];

/**
 * Only same-origin relative paths under /mpc are accepted as redirect targets.
 */
const sanitizeRedirect = (redirect: string | null): string =>
    redirect != null && /^\/mpc(\/[A-Za-z0-9\-_/]*)?$/.test(redirect)
        ? redirect
        : MPC_LIST_PATH;

export const MpcLoginPageClient: React.FC<IMpcLoginPageClientProps> = () => {
    const { t } = useTranslations();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = sanitizeRedirect(searchParams.get('redirect'));
    const { isAuthenticated, session } = useMpcSessionGuard();

    // Accounts without a confirmed authenticator stay on the enrollment step instead of being redirected.
    const needsEnrollment =
        isAuthenticated && session?.user.totpEnabled === false;

    useEffect(() => {
        if (isAuthenticated && !needsEnrollment) {
            router.replace(redirectPath);
        }
    }, [isAuthenticated, needsEnrollment, redirectPath, router]);

    const handleSuccess = () => router.push(redirectPath);

    return (
        <Page.Main fullWidth={true} title={t('app.mpc.mpcLoginPage.title')}>
            <MpcMockBanner />
            <p className="text-neutral-500">
                {t('app.mpc.mpcLoginPage.description')}
            </p>
            <Card className="max-w-xl p-6">
                {needsEnrollment ? (
                    <MpcTotpEnrollment onSuccess={handleSuccess} />
                ) : (
                    <Tabs.Root defaultValue="login" isUnderlined={true}>
                        <Tabs.List>
                            {modes.map((mode) => (
                                <Tabs.Trigger
                                    key={mode}
                                    label={t(
                                        `app.mpc.mpcLoginPage.tabs.${mode}`,
                                    )}
                                    value={mode}
                                />
                            ))}
                        </Tabs.List>
                        {modes.map((mode) => (
                            <Tabs.Content
                                className="pt-6"
                                key={mode}
                                value={mode}
                            >
                                <div className="flex flex-col gap-4">
                                    <Heading size="h3">
                                        {t(
                                            `app.mpc.mpcLoginPage.${mode}.title`,
                                        )}
                                    </Heading>
                                    <p className="text-neutral-500 text-sm">
                                        {t(
                                            `app.mpc.mpcLoginPage.${mode}.description`,
                                        )}
                                    </p>
                                    <MpcLoginForm mode={mode} />
                                </div>
                            </Tabs.Content>
                        ))}
                    </Tabs.Root>
                )}
            </Card>
        </Page.Main>
    );
};
