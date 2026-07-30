import { Heading } from '@aragon/gov-ui-kit';

export const Default = () => <Heading size="h1">Aragon DAO Governance</Heading>;

export const Sizes = () => (
    <div className="flex flex-col gap-4">
        <Heading size="h1">Treasury overview (h1)</Heading>
        <Heading size="h2">Active proposals (h2)</Heading>
        <Heading size="h3">Voting settings (h3)</Heading>
        <Heading size="h4">Members and delegates (h4)</Heading>
        <Heading size="h5">Execution details (h5)</Heading>
    </div>
);

export const SemanticOverride = () => (
    <div className="flex flex-col gap-4">
        <Heading as="h5" size="h1">
            Semantic h5 tag rendered at h1 size
        </Heading>
        <Heading as="h1" size="h5">
            Semantic h1 tag rendered at h5 size
        </Heading>
    </div>
);
