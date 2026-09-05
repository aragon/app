import { ProxySafeUtils } from './proxySafeUtils';

// The singleton asserts the server-side Safe key at boot, so this barrel is server-only. Client
// code that needs the chain coverage table imports `./safeTxServiceNetworks` directly.
export const proxySafeUtils = new ProxySafeUtils();
export type { ISafeRequestParams } from './proxySafeUtils';
