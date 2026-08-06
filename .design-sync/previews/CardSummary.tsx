import { CardSummary, IconType } from '@aragon/gov-ui-kit';

export const Default = () => (
    <CardSummary
        action={{ label: 'Create proposal' }}
        className="w-full"
        description="Proposals created"
        icon={IconType.APP_PROPOSALS}
        value="24"
    />
);

export const Members = () => (
    <CardSummary
        action={{ label: 'Delegate' }}
        className="w-full"
        description="Token holders"
        icon={IconType.APP_MEMBERS}
        value="1.2K"
    />
);

export const HorizontalLayout = () => (
    <CardSummary
        action={{ label: 'View treasury' }}
        className="w-full"
        description="Treasury value in USD"
        icon={IconType.APP_ASSETS}
        isStacked={false}
        value="$1.4M"
    />
);
