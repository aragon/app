export enum CmsServiceKey {
    FEATURED_DAOS = 'FEATURED_DAOS',
    SANCTIONED_ADDRESSES = 'SANCTIONED_ADDRESSES',
}

export const cmsServiceKeys = {
    featuredDaos: () => [CmsServiceKey.FEATURED_DAOS],
    sanctionedAddresses: () => [CmsServiceKey.SANCTIONED_ADDRESSES],
};
