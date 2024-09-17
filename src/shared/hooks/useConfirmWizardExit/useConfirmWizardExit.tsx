import { useEffect } from 'react';
import { useTranslations } from '../../components/translationsProvider';

export const useConfirmWizardExit = (isDirty: boolean, dialogDesc: string) => {
    const { t } = useTranslations();

    useEffect(() => {
        const pushState = () => window.history.pushState(null, '', window.location.href);

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
            }
        };

        const handlePopState = (e: PopStateEvent) => {
            if (isDirty) {
                const confirmLeave = window.confirm(t(dialogDesc));
                if (!confirmLeave) {
                    e.preventDefault();
                    pushState();
                } else {
                    window.history.back();
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isDirty, t]);
};
