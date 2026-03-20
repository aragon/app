import type { Network } from '@/shared/api/daoService';

export type ISanctionedAddressesResult = Partial<Record<Network, string[]>>;
