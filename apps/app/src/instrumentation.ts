import { AragonBackendServiceError } from './shared/api/aragonBackendService';
import { monitoringUtils } from './shared/utils/monitoringUtils';

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await import('../sentry.server.config');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
        await import('../sentry.edge.config');
    }
}

// Expected not-found lookups (bots and stale links probing removed DAO/plugin URLs)
// render 404-style states and are not reported — mirrors the suppression in the
// metadata utils and PageError for render paths without their own error handling.
export const onRequestError: typeof monitoringUtils.logRequestError = (
    error,
    request,
    context,
) => {
    if (AragonBackendServiceError.isExpectedNotFoundError(error)) {
        return;
    }

    return monitoringUtils.logRequestError(error, request, context);
};
