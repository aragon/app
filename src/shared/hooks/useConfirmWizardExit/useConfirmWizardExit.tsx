import { useIsBlocked, useSetIsBlocked } from '@/shared/components/navigationBlockerProvider';
import { useEffect } from 'react';

export const useConfirmWizardExit = (isFormDirty: boolean, exitAlertDescription: string) => {
    const setIsBlocked = useSetIsBlocked();
    const isBlocked = useIsBlocked();

    useEffect(() => {
        setIsBlocked(isFormDirty);

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isFormDirty) {
                e.preventDefault();
            }
        };

        const handlePopState = (e: PopStateEvent) => {
            if (isFormDirty) {
                const confirmLeave = window.confirm(exitAlertDescription);
                if (!confirmLeave) {
                    e.preventDefault();
                    window.history.pushState(null, '', window.location.href);
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
    }, [isBlocked, isFormDirty, exitAlertDescription, setIsBlocked]);
};
