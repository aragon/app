import { Spinner } from '@aragon/gov-ui-kit';

export const Default = () => <Spinner size="lg" variant="neutral" />;

export const Sizes = () => (
    <div className="flex items-end gap-4">
        <Spinner size="sm" variant="primary" />
        <Spinner size="md" variant="primary" />
        <Spinner size="lg" variant="primary" />
        <Spinner size="xl" variant="primary" />
    </div>
);

export const Variants = () => (
    <div className="flex items-center gap-4">
        <Spinner size="lg" variant="neutral" />
        <Spinner size="lg" variant="primary" />
        <Spinner size="lg" variant="success" />
        <Spinner size="lg" variant="warning" />
        <Spinner size="lg" variant="critical" />
        <div className="rounded-lg bg-primary-400 p-2">
            <Spinner size="lg" variant="primaryInverted" />
        </div>
    </div>
);

export const Static = () => (
    <div className="flex items-center gap-4">
        <Spinner size="lg" variant="primary" isLoading={false} />
        <Spinner size="lg" variant="neutral" isLoading={false} />
    </div>
);
