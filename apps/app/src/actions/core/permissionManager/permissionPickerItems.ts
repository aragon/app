import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';

/** Synthetic option letting a permission outside the dictionary be entered by hash. */
export const customPermissionItemId = 'custom-permission-id';

export const permissionIdRegex = /^0x[0-9a-f]{64}$/iu;

export const permissionOptions = permissionNameUtils.getKnownPermissions();

export const permissionItems = permissionOptions.map(({ id, name }) => ({
    id,
    name,
    icon: IconType.APP_PERMISSIONS,
    info: addressUtils.truncateHash(id),
}));
