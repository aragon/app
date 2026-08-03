import { Avatar } from '@aragon/gov-ui-kit';
import { brandedExternals } from '@/plugins/sppPlugin/constants/sppPluginBrandedExternals';
import { PermissionEntityBrandId } from '@/shared/api/daoService';

/**
 * Safe-branded avatar displayed next to entities resolved with `brandId: 'safe'`.
 */
export const SafeAccountAvatar: React.FC = () => (
    <Avatar
        alt="Safe account"
        aria-label="Safe account"
        className="shrink-0"
        fallback={<span aria-label="Safe account" role="img" />}
        size="sm"
        src={brandedExternals[PermissionEntityBrandId.SAFE]?.logo}
    />
);
