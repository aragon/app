import type { IMpcSession } from '@/modules/mpc/api/mpcService/domain';
import { useMpcSession } from '@/modules/mpc/api/mpcService/queries/useMpcSession';

export interface IUseMpcSessionGuardResult {
    /**
     * Current session, undefined when not authenticated or still loading.
     */
    session?: IMpcSession;
    /**
     * Whether the session is being fetched.
     */
    isLoading: boolean;
    /**
     * Whether the user is authenticated (session loaded without error).
     */
    isAuthenticated: boolean;
}

/**
 * Exposes the current MPC session state. Does not redirect: the page decides what to do when unauthenticated.
 */
export const useMpcSessionGuard = (): IUseMpcSessionGuardResult => {
    const { data, isLoading, isError } = useMpcSession();

    return {
        session: data ?? undefined,
        isLoading,
        isAuthenticated: !isLoading && !isError && data != null,
    };
};
