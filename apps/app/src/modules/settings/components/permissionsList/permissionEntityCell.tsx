import {
    AddressOutput,
    Avatar,
    addressUtils,
    DaoAvatar,
    Tag,
} from '@aragon/gov-ui-kit';
import { PermissionEntityExternalBrandId } from '@/shared/api/daoService';
import { ANY_ADDR } from '../../constants/permissionSentinels';
import type { IPermissionEntity } from '../../utils/permissionEntityUtils';
import { MembersAvatarIcon, SafeAccountAvatar } from '../permissionEntityIcons';

interface IPermissionEntityCellProps {
    entity: IPermissionEntity;
}

export const PermissionEntityCell: React.FC<IPermissionEntityCellProps> = ({
    entity,
}) => (
    <span className="flex min-w-0 items-center gap-2 text-neutral-800">
        <AddressOutput address={entity.address} label={entity.label} />
        {entity.type === 'dao' && (
            <DaoAvatar name={entity.label} size="sm" src={entity.avatarSrc} />
        )}
        {entity.brandId === PermissionEntityExternalBrandId.SAFE && (
            <SafeAccountAvatar />
        )}
        {entity.type === 'plugin' &&
            entity.brandId !== PermissionEntityExternalBrandId.SAFE &&
            entity.tag != null && (
                <Tag
                    className="max-w-[140px] shrink-0 [&>p]:truncate"
                    label={entity.tag}
                    variant="primary"
                />
            )}
        {entity.type === 'sentinel' &&
            (addressUtils.isAddressEqual(entity.address, ANY_ADDR) ? (
                <MembersAvatarIcon />
            ) : (
                <Avatar
                    alt=""
                    aria-hidden="true"
                    className="shrink-0"
                    size="sm"
                />
            ))}
    </span>
);
