import { Network } from '@/shared/api/daoService';

/**
 * Networks served by the aragon-domain: aragon-indexer indexes them and the
 * domain controller is built with their RPC urls. Single source for both the
 * controller setup and the BFF routing decision. Expand as more networks are
 * indexed.
 */
export const domainNetworks: readonly Network[] = [Network.ETHEREUM_MAINNET];
