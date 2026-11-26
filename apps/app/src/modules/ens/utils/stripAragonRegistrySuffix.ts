import { memberRegistrySubdomainSuffix } from '../constants/contracts';

/**
 * Shows an Aragon member-registry subdomain (`alice.aragon.eth`) as the subdomain alone (`alice`). Any other name is
 * returned as is. For display only: checks and lookups keep the full name.
 */
export const stripAragonRegistrySuffix = <T extends string | null | undefined>(
    name: T,
): T | string =>
    name?.endsWith(memberRegistrySubdomainSuffix)
        ? name.slice(0, -memberRegistrySubdomainSuffix.length)
        : name;
