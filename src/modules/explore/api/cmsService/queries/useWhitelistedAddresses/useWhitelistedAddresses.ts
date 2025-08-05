import type { QueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { cmsService } from '../../cmsService';
import { cmsServiceKeys } from '../../cmsServiceKeys';
import type { IWhitelistedAddresses } from '../../domain';

export const whitelistedAddressesOptions = (options?: QueryOptions<IWhitelistedAddresses>) => ({
    queryKey: cmsServiceKeys.whitelistedAddresses(),
    queryFn: () => cmsService.getWhitelistedAddresses(),
    staleTime: Infinity,
    ...options,
});

export const useWhitelistedAddresses = (options?: QueryOptions<IWhitelistedAddresses>) => {
    return useQuery<IWhitelistedAddresses, Error, IWhitelistedAddresses>(whitelistedAddressesOptions(options));
};
