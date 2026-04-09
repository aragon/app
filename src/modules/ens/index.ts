/**
 * ENS module — single source of truth for all ENS resolution in the app.
 *
 * Provides hooks to resolve ENS names, avatars, and text records (bio, links).
 * Centralises `chainId`, cache TTLs, and record-key configuration so consumers
 * don't duplicate config.
 *
 * @example
 * ```ts
 * // In a list item or header
 * const { data: ensName } = useEnsName(address);
 * const { data: ensAvatar } = useEnsAvatar(ensName);
 *
 * // On a detail page
 * const { data: ensRecords } = useEnsRecords(ensName);
 * ```
 */
export {
    ENS_AVATAR_KEY,
    ENS_CACHE,
    ENS_CHAIN_ID,
    ENS_RECORD_KEYS,
} from './constants/ensConfig';
export { memberRegistryAddress } from './constants/registry';
export { useEnsAvatar } from './hooks/useEnsAvatar';
export { useEnsName } from './hooks/useEnsName';
export { useEnsRecords } from './hooks/useEnsRecords';
export type { IEnsRecords, TEnsRecordKey } from './types';
export type { IBuildUpdateRecordsTransactionParams } from './utils/ensTransactionUtils';
export { ensTransactionUtils } from './utils/ensTransactionUtils';
