import { useBlockNavigationContext } from '@/shared/components/blockNavigationContext';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useEffect } from 'react';

export const useConfirmWizardExit = (isFormDirty: boolean) => {
    const { setIsBlocked } = useBlockNavigationContext();
    const { t } = useTranslations();

    useEffect(() => {
        setIsBlocked(isFormDirty);

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };

        const handlePopState = () => {
            const confirmLeave = window.confirm(t('app.shared.confirmWizardExit.message'));

            if (confirmLeave) {
                window.removeEventListener('popstate', handlePopState);
                setIsBlocked(false);
                window.history.back();
            } else {
                window.history.pushState(null, '', window.location.href);
            }
        };

        if (isFormDirty) {
            window.history.pushState(null, '', window.location.href);
            window.addEventListener('popstate', handlePopState);
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            setIsBlocked(false);
        };
    }, [isFormDirty, t, setIsBlocked]);
};
