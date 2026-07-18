import { EmptyState } from '@aragon/gov-ui-kit';

export const Default = () => (
    <EmptyState
        description="Once the DAO receives assets, they will show up here."
        heading="No transactions yet"
        objectIllustration={{ object: 'LIGHTBULB' }}
    />
);

export const StackedWithActions = () => (
    <EmptyState
        description="Create the first proposal so members can vote on it."
        heading="No proposals yet"
        objectIllustration={{ object: 'LIGHTBULB' }}
        primaryButton={{ label: 'Create proposal' }}
        secondaryButton={{ label: 'Learn more' }}
    />
);

export const HorizontalWithObject = () => (
    <EmptyState
        description="Deposit tokens into the treasury to start funding community initiatives."
        heading="Treasury is empty"
        isStacked={false}
        objectIllustration={{ object: 'WALLET' }}
        secondaryButton={{ label: 'Deposit assets' }}
    />
);

export const WithHumanIllustration = () => (
    <EmptyState
        description="You have not delegated your voting power yet. Delegate to an active member to keep the DAO moving."
        heading="No delegation set"
        humanIllustration={{
            accessory: 'BUDDHA',
            body: 'VOTING',
            expression: 'SMILE',
            hairs: 'MIDDLE',
            sunglasses: 'BIG_ROUNDED',
        }}
        primaryButton={{ label: 'Delegate votes' }}
    />
);
