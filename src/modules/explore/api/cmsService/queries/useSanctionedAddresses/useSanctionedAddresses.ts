import type { QueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { cmsService } from '../../cmsService';
import { cmsServiceKeys } from '../../cmsServiceKeys';
import type { ISanctionedAddressesResult } from '../../domain';

export const sanctionedAddressesOptions = (options?: QueryOptions<ISanctionedAddressesResult>) => ({
    queryKey: cmsServiceKeys.sanctionedAddresses(),
    queryFn: () => cmsService.getSanctionedAddresses(),
    staleTime: Infinity,
    ...options,
});

export const useSanctionedAddresses = (options?: QueryOptions<ISanctionedAddressesResult>) => {
    return useQuery(sanctionedAddressesOptions(options));
};
