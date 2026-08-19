import 'server-only';
import type {
    IMpcLoginResponse,
    IMpcSessionResponse,
} from '@/modules/mpc/api/mpcService/domain';
import { jsonOk, noContent, withApi } from './mpcApiUtils';
import { getRequestMeta, MPC_SESSION_COOKIE, mpcAuth } from './mpcAuth';
import { readJsonBody, validateLoginParams } from './mpcRequestValidation';

/**
 * Route handlers for /api/mpc/auth/*.
 */

// POST /api/mpc/auth/register
export const handleRegister = withApi<Record<string, never>>(
    async (request) => {
        const params = validateLoginParams(await readJsonBody(request));
        const { session, token } = await mpcAuth.register(
            params,
            getRequestMeta(request),
        );

        return jsonOk<IMpcLoginResponse>(session, {
            status: 201,
            headers: {
                'Set-Cookie': mpcAuth.buildSessionCookie(
                    token,
                    session.expiresAt,
                ),
            },
        });
    },
);

// POST /api/mpc/auth/login
export const handleLogin = withApi<Record<string, never>>(async (request) => {
    const params = validateLoginParams(await readJsonBody(request));
    const { session, token } = await mpcAuth.login(
        params,
        getRequestMeta(request),
    );

    return jsonOk<IMpcLoginResponse>(session, {
        headers: {
            'Set-Cookie': mpcAuth.buildSessionCookie(token, session.expiresAt),
        },
    });
});

// POST /api/mpc/auth/logout
export const handleLogout = withApi<Record<string, never>>((request) => {
    mpcAuth.logout(request.cookies.get(MPC_SESSION_COOKIE)?.value);

    return Promise.resolve(
        noContent({ 'Set-Cookie': mpcAuth.buildClearSessionCookie() }),
    );
});

// GET /api/mpc/auth/session
export const handleGetSession = withApi<Record<string, never>>((request) => {
    const { user, session } = mpcAuth.requireSession(request);

    return Promise.resolve(
        jsonOk<IMpcSessionResponse>({ user, expiresAt: session.expiresAt }),
    );
});
