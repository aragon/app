import { useQuery } from '@tanstack/react-query';
import type { QueryOptions } from '@/shared/types';
import { cmsService } from '../../cmsService';
import { cmsServiceKeys } from '../../cmsServiceKeys';
import type { IFeaturedDao } from '../../domain';

export const featuredDaosOptions = (
    options?: QueryOptions<IFeaturedDao[]>,
) => ({
    queryKey: cmsServiceKeys.featuredDaos(),
    queryFn: () => cmsService.getFeaturedDaos(),
    staleTime: Number.POSITIVE_INFINITY,
    ...options,
});

export const useFeaturedDaos = (options?: QueryOptions<IFeaturedDao[]>) =>
    useQuery(featuredDaosOptions(options));
