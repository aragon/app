import { Tag } from '@aragon/gov-ui-kit';

export const Default = () => (
    <div className="flex">
        <Tag label="Active" variant="primary" />
    </div>
);

export const Variants = () => (
    <div className="flex flex-wrap items-center gap-3">
        <Tag label="Draft" variant="neutral" />
        <Tag label="Active" variant="primary" />
        <Tag label="Pending" variant="info" />
        <Tag label="Executed" variant="success" />
        <Tag label="Expiring soon" variant="warning" />
        <Tag label="Vetoed" variant="critical" />
    </div>
);
