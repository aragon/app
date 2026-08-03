import { Avatar, addressUtils, DaoAvatar, Tag } from '@aragon/gov-ui-kit';
import { PermissionEntityBrandId } from '@/shared/api/daoService';
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
        <span className="truncate">{entity.label}</span>
        {entity.type === 'dao' && (
            <DaoAvatar name={entity.label} size="sm" src={entity.avatarSrc} />
        )}
        {entity.brandId === PermissionEntityBrandId.SAFE && (
            <SafeAccountAvatar />
        )}
        {entity.type === 'plugin' &&
            entity.brandId !== PermissionEntityBrandId.SAFE &&
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
