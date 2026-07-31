import { Avatar, AvatarIcon, IconType } from '@aragon/gov-ui-kit';
import safeWallet from '@/assets/images/safeWallet.png';

/**
 * Safe-branded avatar displayed next to entities resolved with `brandId: 'safe'`.
 */
export const SafeAccountAvatar: React.FC = () => (
    <span aria-label="Safe account" className="shrink-0" role="img">
        <Avatar size="sm" src={safeWallet.src} />
    </span>
);

/**
 * Members icon displayed for the ANY_ADDR ("Anyone") permission sentinel.
 */
export const MembersAvatarIcon: React.FC = () => (
    <span aria-label="Members" className="shrink-0" role="img">
        <AvatarIcon icon={IconType.APP_MEMBERS} size="sm" variant="primary" />
    </span>
);
