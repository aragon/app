export enum CmsServiceKey {
    FEATURED_DAOS = 'FEATURED_DAOS',
    WHITELISTED_ADDRESSES = 'WHITELISTED_ADDRESSES',
    SANCTIONED_ADDRESSES = 'SANCTIONED_ADDRESSES',
}

export const cmsServiceKeys = {
    featuredDaos: () => [CmsServiceKey.FEATURED_DAOS],
    whitelistedAddresses: () => [CmsServiceKey.WHITELISTED_ADDRESSES],
    sanctionedAddresses: () => [CmsServiceKey.SANCTIONED_ADDRESSES],
};
