'use client';

import { useEffect } from 'react';
import { ErrorFeedback } from '@/shared/components/errorFeedback';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';

export interface IGlobalErrorProps {
    /**
     * Unhandled error thrown by root layout component.
     */
    error: Error;
}

export const GlobalError: React.FC<IGlobalErrorProps> = (props) => {
    const { error } = props;

    useEffect(() => {
        monitoringUtils.logError(error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <ErrorFeedback />
            </body>
        </html>
    );
};
