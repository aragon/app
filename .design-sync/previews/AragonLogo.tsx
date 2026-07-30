import { AragonLogo } from '@aragon/gov-ui-kit';

export const Default = () => (
    <div className="flex">
        <AragonLogo />
    </div>
);

export const Sizes = () => (
    <div className="flex flex-col items-start gap-4">
        <AragonLogo size="sm" />
        <AragonLogo size="md" />
        <AragonLogo size="lg" />
    </div>
);

export const IconOnly = () => (
    <div className="flex items-center gap-4">
        <AragonLogo iconOnly={true} size="sm" />
        <AragonLogo iconOnly={true} size="md" />
        <AragonLogo iconOnly={true} size="lg" />
    </div>
);

export const WhiteVariant = () => (
    <div className="flex items-center gap-6 rounded-xl bg-neutral-800 p-6">
        <AragonLogo variant="white" />
        <AragonLogo iconOnly={true} variant="white" />
    </div>
);
