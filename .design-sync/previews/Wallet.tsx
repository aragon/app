import { GukModulesProvider, Wallet } from '@aragon/gov-ui-kit';

const blueAvatar =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%233164fa'/%3E%3Ccircle cx='16' cy='12' r='6' fill='%23a8c0ff'/%3E%3Ccircle cx='16' cy='28' r='9' fill='%23a8c0ff'/%3E%3C/svg%3E";

const tealAvatar =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230e7490'/%3E%3Cpath d='M0 32 L16 4 L32 32 Z' fill='%2367e8f9'/%3E%3C/svg%3E";

export const Disconnected = () => (
    <GukModulesProvider>
        <Wallet />
    </GukModulesProvider>
);

export const Connected = () => (
    <GukModulesProvider>
        <Wallet
            user={{ address: '0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD', avatarSrc: blueAvatar, name: 'cgero.eth' }}
        />
    </GukModulesProvider>
);

export const CustomName = () => (
    <GukModulesProvider>
        <Wallet
            user={{ address: '0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5', avatarSrc: tealAvatar, name: 'Aragon DAO' }}
        />
    </GukModulesProvider>
);
