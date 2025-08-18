'use client';

import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { useEffect } from 'react';
import { ErrorFeedback, type IErrorFeedbackProps } from '../../errorFeedback';
import { useTranslations } from '../../translationsProvider';

export interface IPageErrorProps extends Pick<IErrorFeedbackProps, 'title' | 'description'> {
    /**
     * Error to be processed.
     */
    error?: unknown;
    /**
     * Link of the primary action.
     */
    actionLink?: string;
    /**
     * Namespace used to render the error message.
     */
    errorNamespace: string;
}

export const PageError: React.FC<IPageErrorProps> = (props) => {
    const { error, actionLink, errorNamespace, title, description } = props;

    const { t } = useTranslations();

    useEffect(() => monitoringUtils.logError(error), [error]);

    const primaryButton = actionLink ? { label: t(`${errorNamespace}.action`), href: actionLink } : undefined;

    if (AragonBackendServiceError.isNotFoundError(error)) {
        return (
            <ErrorFeedback
                title={t(`${errorNamespace}.notFound.title`)}
                description={t(`${errorNamespace}.notFound.description`)}
                primaryButton={primaryButton}
                illustration="NOT_FOUND"
                hideReportButton={true}
            />
        );
    }

    return (
        <ErrorFeedback
            title={title ? t(title) : undefined}
            description={description ? t(description) : undefined}
            primaryButton={primaryButton}
        />
    );
};
