export interface IBannerContentDefinition {
    /**
     * Priority of the banner, lowest priority is displayed first.
     */
    priority: number;
    /**
     * Type used as translation namespace for the message and button label.
     */
    type: BannerContentType;
    /**
     * Function used to build the link of the banner button.
     */
    getButtonLink: (daoId: string) => string;
}

export enum BannerContentType {
    ADMIN_MEMBER = 'ADMIN_MEMBER',
    ADMIN_PLUGIN = 'ADMIN_PLUGIN',
}

export const bannerContentDefinitions: Record<BannerContentType, IBannerContentDefinition> = {
    [BannerContentType.ADMIN_MEMBER]: {
        priority: 1,
        type: BannerContentType.ADMIN_MEMBER,
        getButtonLink: (daoId) => `/dao/${daoId}/create/process`,
    },
    [BannerContentType.ADMIN_PLUGIN]: {
        priority: 2,
        type: BannerContentType.ADMIN_PLUGIN,
        getButtonLink: (daoId) => `/dao/${daoId}/members`,
    },
};
