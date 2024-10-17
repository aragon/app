import { type IBannerContent } from '@/shared/components/banner';
import { BannerType } from '@/shared/types/enum/bannerType';

export const bannerContent: Record<
    BannerType,
    Omit<IBannerContent<string>, 'buttonHref'> & { buttonHref: (params: { id: string }) => string }
> = {
    [BannerType.IS_ADMIN]: {
        priority: 1,
        message: 'app.shared.bannerContent.IS_ADMIN.message',
        buttonLabel: 'app.shared.bannerContent.IS_ADMIN.buttonLabel',
        buttonHref: ({ id }) => `/dao/${id}/create/process`,
    },
    [BannerType.HAS_ADMIN]: {
        priority: 2,
        message: 'app.shared.bannerContent.HAS_ADMIN.message',
        buttonLabel: 'app.shared.bannerContent.HAS_ADMIN.buttonLabel',
        buttonHref: ({ id }) => `/dao/${id}/members`,
    },
};
