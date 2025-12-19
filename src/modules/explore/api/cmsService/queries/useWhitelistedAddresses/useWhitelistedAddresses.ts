import { useQuery } from '@tanstack/react-query';
import type { QueryOptions } from '@/shared/types';
import { cmsService } from '../../cmsService';
import { cmsServiceKeys } from '../../cmsServiceKeys';
import type { IWhitelistedAddresses } from '../../domain';

export const whitelistedAddressesOptions = (
    options?: QueryOptions<IWhitelistedAddresses>,
) => ({
    queryKey: cmsServiceKeys.whitelistedAddresses(),
    queryFn: () => cmsService.getWhitelistedAddresses(),
    staleTime: Number.POSITIVE_INFINITY,
    ...options,
});

export const useWhitelistedAddresses = (
    options?: QueryOptions<IWhitelistedAddresses>,
) =>
    useQuery<IWhitelistedAddresses, Error, IWhitelistedAddresses>(
        whitelistedAddressesOptions(options),
    );
