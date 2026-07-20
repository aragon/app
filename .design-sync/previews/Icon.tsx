import { Icon, IconType } from '@aragon/gov-ui-kit';

export const Default = () => <Icon icon={IconType.PLUS} />;

export const Sizes = () => (
    <div className="flex items-end gap-4">
        <Icon icon={IconType.APP_PROPOSALS} size="sm" />
        <Icon icon={IconType.APP_PROPOSALS} size="md" />
        <Icon icon={IconType.APP_PROPOSALS} size="lg" />
    </div>
);

export const GovernanceIcons = () => (
    <div className="flex flex-wrap items-center gap-4">
        <Icon icon={IconType.APP_DASHBOARD} size="lg" />
        <Icon icon={IconType.APP_PROPOSALS} size="lg" />
        <Icon icon={IconType.APP_MEMBERS} size="lg" />
        <Icon icon={IconType.APP_ASSETS} size="lg" />
        <Icon icon={IconType.APP_TRANSACTIONS} size="lg" />
        <Icon icon={IconType.BLOCKCHAIN_WALLET} size="lg" />
        <Icon icon={IconType.BLOCKCHAIN_SMARTCONTRACT} size="lg" />
        <Icon icon={IconType.CALENDAR} size="lg" />
        <Icon icon={IconType.SETTINGS} size="lg" />
        <Icon icon={IconType.DEPOSIT} size="lg" />
        <Icon icon={IconType.WITHDRAW} size="lg" />
        <Icon icon={IconType.LINK_EXTERNAL} size="lg" />
    </div>
);

export const StatusColors = () => (
    <div className="flex items-center gap-4">
        <Icon className="text-info-500" icon={IconType.INFO} size="lg" />
        <Icon className="text-success-500" icon={IconType.SUCCESS} size="lg" />
        <Icon className="text-warning-500" icon={IconType.WARNING} size="lg" />
        <Icon
            className="text-critical-500"
            icon={IconType.CRITICAL}
            size="lg"
        />
        <Icon
            className="text-primary-400"
            icon={IconType.CHECKMARK}
            size="lg"
        />
    </div>
);
