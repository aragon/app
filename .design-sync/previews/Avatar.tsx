import { Avatar } from '@aragon/gov-ui-kit';

const memberImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%233164fa'/%3E%3Ccircle cx='32' cy='24' r='11' fill='%23b8c8fd'/%3E%3Cellipse cx='32' cy='54' rx='19' ry='14' fill='%23b8c8fd'/%3E%3C/svg%3E";

const initialsFallback = (label: string) => (
    <span className="flex size-full items-center justify-center bg-primary-400 text-neutral-0">
        {label}
    </span>
);

export const Default = () => <Avatar size="md" src={memberImage} />;

export const Sizes = () => (
    <div className="flex items-end gap-4">
        <Avatar size="xs" src={memberImage} />
        <Avatar size="sm" src={memberImage} />
        <Avatar size="md" src={memberImage} />
        <Avatar size="lg" src={memberImage} />
        <Avatar size="xl" src={memberImage} />
        <Avatar size="2xl" src={memberImage} />
    </div>
);

export const DefaultFallback = () => (
    <div className="flex items-center gap-4">
        <Avatar size="sm" />
        <Avatar size="md" />
        <Avatar size="lg" />
    </div>
);

export const CustomFallback = () => (
    <div className="flex items-center gap-4">
        <Avatar
            fallback={initialsFallback('AD')}
            size="md"
            src="broken-image"
        />
        <Avatar
            fallback={initialsFallback('SO')}
            size="lg"
            src="broken-image"
        />
        <Avatar
            fallback={initialsFallback('GV')}
            size="xl"
            src="broken-image"
        />
    </div>
);
