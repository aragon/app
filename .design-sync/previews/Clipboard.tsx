import { Clipboard } from '@aragon/gov-ui-kit';

export const Default = () => (
    <div className="flex">
        <Clipboard copyValue="0x1a9C8182C09F50C8318d769245beA52c32BE35BC" />
    </div>
);

export const WithAddress = () => (
    <div className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-3">
        <span className="text-neutral-500 text-sm">0x1a9C…35BC</span>
        <Clipboard copyValue="0x1a9C8182C09F50C8318d769245beA52c32BE35BC" variant="avatar-white-bg" />
    </div>
);

export const Sizes = () => (
    <div className="flex items-center gap-4">
        <Clipboard copyValue="dao.aragon.eth" size="sm" />
        <Clipboard copyValue="dao.aragon.eth" size="md" />
        <Clipboard copyValue="dao.aragon.eth" size="lg" />
    </div>
);

export const AvatarVariants = () => (
    <div className="flex items-center gap-4 rounded-xl bg-neutral-50 p-4">
        <Clipboard copyValue="vitalik.eth" variant="avatar" />
        <Clipboard copyValue="vitalik.eth" variant="avatar-white-bg" />
        <Clipboard copyValue="vitalik.eth" variant="avatar-neutral-white-bg" />
    </div>
);
