export interface IMpcUser {
    /**
     * Unique identifier of the user (POC mock auth).
     */
    id: string;
    /**
     * Username used to log in.
     */
    username: string;
    /**
     * Creation timestamp (ISO 8601).
     */
    createdAt: string;
    /**
     * Whether the user confirmed a TOTP (authenticator app) enrollment. Once enabled, the code is required to
     * release the server share and to approve sign requests.
     */
    totpEnabled: boolean;
}

export interface IMpcSession {
    /**
     * Authenticated user.
     */
    user: IMpcUser;
    /**
     * Session expiration timestamp (ISO 8601).
     */
    expiresAt: string;
}
