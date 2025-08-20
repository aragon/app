'use client';

import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { useEffect } from 'react';
import { ErrorFeedback, type IErrorFeedbackProps } from '../../errorFeedback';
import { useTranslations } from '../../translationsProvider';

export interface IPageErrorProps extends Pick<IErrorFeedbackProps, 'titleKey' | 'descriptionKey'> {
    /**
     * Error to be processed.
     */
    error?: unknown;
    /**
     * Link of the primary action.
     */
    actionLink?: string;
    /**
     * Namespace used to render the not-found error message and action link label.
     */
    errorNamespace?: string;
}

export const PageError: React.FC<IPageErrorProps> = (props) => {
    const { error, actionLink, errorNamespace = '', titleKey, descriptionKey } = props;

    const { t } = useTranslations();

    useEffect(() => {
        if (error != null) {
            monitoringUtils.logError(error);
        }
    }, [error]);

    const isNotFoundError = AragonBackendServiceError.isNotFoundError(error);

    const processedTitle = isNotFoundError ? `${errorNamespace}.notFound.title` : titleKey;
    const processedDescription = isNotFoundError ? `${errorNamespace}.notFound.description` : descriptionKey;

    const primaryButton = actionLink ? { label: t(`${errorNamespace}.action`), href: actionLink } : undefined;

    return (
        <ErrorFeedback
            titleKey={processedTitle}
            descriptionKey={processedDescription}
            primaryButton={primaryButton}
            illustration={isNotFoundError ? 'NOT_FOUND' : undefined}
            hideReportButton={isNotFoundError}
        />
    );
};
