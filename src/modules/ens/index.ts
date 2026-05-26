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
 * const { data: ensRecords } = useEnsProfileRecords(ensName);
 * ```
 */

export * from './constants/contracts';
export {
    ensAvatarKey,
    ensCache,
    ensChainId,
    ensRecordKeys,
} from './constants/ensConfig';
export {
    buildEnsDelegateKey,
    type IBuildEnsDelegateKeyParams,
    NETWORK_EIP3770_SHORTNAME,
} from './constants/ensDelegateKey';
export { memberRegistryAbi } from './constants/memberRegistryAbi';
export {
    type IUseDelegateStatementCidParams,
    useDelegateStatementCid,
} from './hooks/useDelegateStatementCid';
export { useEnsAvatar } from './hooks/useEnsAvatar';
export { useEnsName } from './hooks/useEnsName';
export { useEnsProfileRecords } from './hooks/useEnsProfileRecords';
export type { IEnsRecords, TEnsRecordKey } from './types';
export type { IBuildUpdateRecordsTransactionParams } from './utils/ensTransactionUtils';
export { ensTransactionUtils } from './utils/ensTransactionUtils';
