'use client';

import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { useEffect } from 'react';
import { ErrorFeedback } from '../../errorFeedback';
import { useTranslations } from '../../translationsProvider';

export interface IPageErrorProps {
    /**
     * Error to be processed.
     */
    error: unknown;
    /**
     * Link of the primary action.
     */
    actionLink: string;
    /**
     * Namespace used to render the 404 not found error message.
     */
    notFoundNamespace: string;
}

export const PageError: React.FC<IPageErrorProps> = (props) => {
    const { error, actionLink, notFoundNamespace } = props;

    const { t } = useTranslations();

    useEffect(() => {
        monitoringUtils.logError(error);
    }, [error]);

    if (!AragonBackendServiceError.isNotFoundError(error)) {
        return <ErrorFeedback primaryButton={{ label: t(`${notFoundNamespace}.notFound.action`), href: actionLink }} />;
    }

    return (
        <ErrorFeedback
            title={t(`${notFoundNamespace}.notFound.title`)}
            description={t(`${notFoundNamespace}.notFound.description`)}
            primaryButton={{ label: t(`${notFoundNamespace}.notFound.action`), href: actionLink }}
            illustration="NOT_FOUND"
            hideReportButton={true}
        />
    );
};
