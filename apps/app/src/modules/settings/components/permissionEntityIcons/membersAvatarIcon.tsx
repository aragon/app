import { AvatarIcon, IconType } from '@aragon/gov-ui-kit';

/**
 * Members icon displayed for the ANY_ADDR ("Anyone") permission sentinel.
 */
export const MembersAvatarIcon: React.FC = () => (
    <AvatarIcon
        aria-label="Members"
        className="shrink-0"
        icon={IconType.APP_MEMBERS}
        role="img"
        size="sm"
        variant="primary"
    />
);
