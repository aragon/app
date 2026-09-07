export enum CmsServiceKey {
    DAO_OVERRIDES = 'DAO_OVERRIDES',
    FEATURED_DAOS = 'FEATURED_DAOS',
    SANCTIONED_ADDRESSES = 'SANCTIONED_ADDRESSES',
}

export const cmsServiceKeys = {
    daoOverrides: () => [CmsServiceKey.DAO_OVERRIDES],
    featuredDaos: () => [CmsServiceKey.FEATURED_DAOS],
    sanctionedAddresses: () => [CmsServiceKey.SANCTIONED_ADDRESSES],
};
