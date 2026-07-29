import { CardEmptyState } from '@aragon/gov-ui-kit';

export const Default = () => (
    <CardEmptyState
        className="w-full"
        description="Create the first proposal to start making decisions together."
        heading="No proposals yet"
        objectIllustration={{ object: 'LIGHTBULB' }}
    />
);

export const WithActions = () => (
    <CardEmptyState
        className="w-full"
        description="The DAO treasury is empty. Deposit assets to start funding proposals."
        heading="No assets found"
        objectIllustration={{ object: 'WALLET' }}
        primaryButton={{ label: 'Deposit assets' }}
        secondaryButton={{ label: 'Learn more' }}
    />
);

export const Horizontal = () => (
    <CardEmptyState
        className="w-full"
        description="Invite members or distribute the governance token to grow the community."
        heading="No members yet"
        isStacked={false}
        objectIllustration={{ object: 'USERS' }}
        secondaryButton={{ label: 'Add members' }}
    />
);
