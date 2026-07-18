import { GukModulesProvider, MemberAvatar } from '@aragon/gov-ui-kit';

// Broken image source: disables the online ENS lookups (avatarSrc != null) and
// fails to load instantly, so the deterministic blockies fallback renders offline.
const blockiesFallback = 'data:image/png;base64,';

const avatarImage =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='%23F59E0B'/><circle cx='32' cy='24' r='12' fill='%23FDE68A'/><ellipse cx='32' cy='54' rx='20' ry='14' fill='%23FDE68A'/></svg>";

export const Default = () => (
    <GukModulesProvider>
        <MemberAvatar address="0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD" avatarSrc={blockiesFallback} />
    </GukModulesProvider>
);

export const Sizes = () => (
    <GukModulesProvider>
        <div className="flex items-end gap-4">
            <MemberAvatar address="0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786" avatarSrc={blockiesFallback} size="xs" />
            <MemberAvatar address="0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786" avatarSrc={blockiesFallback} size="sm" />
            <MemberAvatar address="0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786" avatarSrc={blockiesFallback} size="md" />
            <MemberAvatar address="0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786" avatarSrc={blockiesFallback} size="lg" />
            <MemberAvatar address="0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786" avatarSrc={blockiesFallback} size="xl" />
            <MemberAvatar address="0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786" avatarSrc={blockiesFallback} size="2xl" />
        </div>
    </GukModulesProvider>
);

export const WithImage = () => (
    <GukModulesProvider>
        <div className="flex items-end gap-4">
            <MemberAvatar address="0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5" avatarSrc={avatarImage} size="md" />
            <MemberAvatar address="0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5" avatarSrc={avatarImage} size="2xl" />
        </div>
    </GukModulesProvider>
);
