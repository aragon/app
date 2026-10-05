import type { Address, HexString } from '@/domain/primitives';
import type { ENSName } from './ENSName';

export interface ENSStore {
  /**
   * Resolves the primary ENS name for each address.
   *
   * Returns a map keyed by checksummed hex address. Addresses with no
   * primary name, or whose name fails resolution or normalization, are
   * absent from the map. A missing key means "no name", never an error.
   */
  lookUpPrimaryNames(addresses: Address[]): Promise<Map<HexString, ENSName>>;
}
