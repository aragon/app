export type ApiVersion = 'v2' | 'v3';

export interface IBuildVersionedUrlOptions {
    /**
     * API version to use (defaults to environment version if not provided)
     */
    version?: ApiVersion;
    /**
     * Force a specific version regardless of environment
     * Useful for endpoints that must stay on a specific version
     */
    forceVersion?: ApiVersion;
}
