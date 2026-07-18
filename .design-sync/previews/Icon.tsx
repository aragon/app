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
        <Icon icon={IconType.INFO} size="lg" className="text-info-500" />
        <Icon icon={IconType.SUCCESS} size="lg" className="text-success-500" />
        <Icon icon={IconType.WARNING} size="lg" className="text-warning-500" />
        <Icon icon={IconType.CRITICAL} size="lg" className="text-critical-500" />
        <Icon icon={IconType.CHECKMARK} size="lg" className="text-primary-400" />
    </div>
);
