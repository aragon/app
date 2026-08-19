'use client';

import { AlertCard } from '@aragon/gov-ui-kit';
import { MpcApiError } from '@/modules/mpc/api/mpcService';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcErrorAlertProps {
    /**
     * Error to display, nothing is rendered when null.
     */
    error?: unknown;
    /**
     * Additional classes for the alert.
     */
    className?: string;
}

/**
 * Extracts a human readable message from an unknown error (MpcApiError code + message when available).
 */
export const getMpcErrorMessage = (error: unknown): string => {
    if (MpcApiError.isMpcApiError(error)) {
        return `${error.message} (${error.code})`;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return String(error);
};

export const MpcErrorAlert: React.FC<IMpcErrorAlertProps> = (props) => {
    const { error, className } = props;
    const { t } = useTranslations();

    if (error == null) {
        return null;
    }

    return (
        <AlertCard
            className={className}
            message={t('app.mpc.mpcErrorAlert.title')}
            variant="critical"
        >
            <p className="break-words">{getMpcErrorMessage(error)}</p>
        </AlertCard>
    );
};
