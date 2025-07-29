import { cmsService, cmsServiceKeys } from '@/modules/explore/api/cmsService';
import { type QueryOptions, useQuery } from '@tanstack/react-query';
import type { IWhitelistedAddresses } from '../../domain';

export const whitelistedAddressesOptions = (options?: QueryOptions<IWhitelistedAddresses>) => ({
    queryKey: cmsServiceKeys.whitelistedAddresses(),
    queryFn: () => cmsService.getWhitelistedAddresses(),
    ...options,
});

export const useWhitelistedAddresses = (options?: QueryOptions<IWhitelistedAddresses>) => {
    return useQuery(whitelistedAddressesOptions(options));
};
