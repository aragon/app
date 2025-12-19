/**
 * Response type for CMS feature flags.
 *
 * CMS feature flags override the default values defined in code.
 * The key must match a FeatureFlagKey defined in the codebase.
 *
 * **Format options:**
 *
 * 1. **Simple format** - Same value for all environments:
 *    ```json
 *    {
 *      "subDao": true
 *    }
 *    ```
 *
 * 2. **Environment-specific format** - Different values per environment:
 *    ```json
 *    {
 *      "subDao": {
 *        "local": true,
 *        "preview": false,
 *        "development": true,
 *        "staging": false,
 *        "production": false
 *      }
 *    }
 *    ```
 *
 * 3. **Mixed format** - Some flags with simple values, some with environment-specific:
 *    ```json
 *    {
 *      "debugPanel": true,
 *      "subDao": {
 *        "local": true,
 *        "preview": false,
 *        "production": false
 *      }
 *    }
 *    ```
 *
 * **Supported environments:**
 * - `local` - Local development
 * - `preview` - Preview deployments
 * - `development` - Development environment
 * - `staging` - Staging environment
 * - `production` - Production environment
 *
 * **Note:** CMS values override code defaults but can be further overridden by local cookie-based overrides.
 *
 * @see {@link FeatureFlagDefinition} for the code definition structure
 * @see {@link FEATURE_FLAG_DEFINITIONS} where flags are defined in code
 */
export type ICmsFeatureFlagsResponse = Record<
    string,
    boolean | Partial<Record<string, boolean>>
>;
