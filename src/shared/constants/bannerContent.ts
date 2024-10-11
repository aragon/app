import { type IBannerContent } from '@/shared/components/banner';
import { BannerType } from '@/shared/types/enum/bannerType';

export const BannerContent: Record<
    BannerType,
    Omit<IBannerContent<string>, 'href'> & { href: (params: { id: string }) => string }
> = {
    [BannerType.IS_ADMIN]: {
        priority: 1,
        message:
            'Your DAO is under construction. You can create any number of custom governance processes for your DAO.',
        buttonLabel: 'Add Governance',
        href: ({ id }) => `/dao/${id}/create/process`,
    },
    [BannerType.HAS_ADMIN]: {
        priority: 2,
        message:
            'This DAO is under construction. One or more admins can make any change to the DAO without a proposal.',
        buttonLabel: 'View Admins',
        href: ({ id }) => `/dao/${id}/members`,
    },
};
