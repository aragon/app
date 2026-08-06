import { AvatarIcon, IconType } from '@aragon/gov-ui-kit';

export const Default = () => <AvatarIcon icon={IconType.APP_PROPOSALS} />;

export const Variants = () => (
    <div className="flex items-center gap-4">
        <AvatarIcon icon={IconType.APP_PROPOSALS} variant="neutral" />
        <AvatarIcon icon={IconType.BLOCKCHAIN_WALLET} variant="primary" />
        <AvatarIcon icon={IconType.INFO} variant="info" />
        <AvatarIcon icon={IconType.CHECKMARK} variant="success" />
        <AvatarIcon icon={IconType.WARNING} variant="warning" />
        <AvatarIcon icon={IconType.CRITICAL} variant="critical" />
    </div>
);

export const Sizes = () => (
    <div className="flex items-end gap-4">
        <AvatarIcon icon={IconType.APP_MEMBERS} size="sm" variant="primary" />
        <AvatarIcon icon={IconType.APP_MEMBERS} size="md" variant="primary" />
        <AvatarIcon icon={IconType.APP_MEMBERS} size="lg" variant="primary" />
    </div>
);

export const BackgroundWhite = () => (
    <div className="flex items-center gap-4 rounded-xl bg-neutral-100 p-4">
        <AvatarIcon
            backgroundWhite={true}
            icon={IconType.APP_ASSETS}
            variant="primary"
        />
        <AvatarIcon
            backgroundWhite={true}
            icon={IconType.CHECKMARK}
            variant="success"
        />
        <AvatarIcon
            backgroundWhite={true}
            icon={IconType.WARNING}
            variant="warning"
        />
    </div>
);
