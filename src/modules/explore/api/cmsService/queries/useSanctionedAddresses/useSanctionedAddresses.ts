import { useQuery } from '@tanstack/react-query';
import type { QueryOptions } from '@/shared/types';
import { cmsService } from '../../cmsService';
import { cmsServiceKeys } from '../../cmsServiceKeys';
import type { ISanctionedAddressesResult } from '../../domain';

export const sanctionedAddressesOptions = (options?: QueryOptions<ISanctionedAddressesResult>) => ({
    queryKey: cmsServiceKeys.sanctionedAddresses(),
    queryFn: () => cmsService.getSanctionedAddresses(),
    staleTime: Number.POSITIVE_INFINITY,
    ...options,
});

export const useSanctionedAddresses = (options?: QueryOptions<ISanctionedAddressesResult>) => useQuery(sanctionedAddressesOptions(options));
