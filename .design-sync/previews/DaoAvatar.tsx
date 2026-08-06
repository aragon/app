import { DaoAvatar, GukModulesProvider } from '@aragon/gov-ui-kit';

const daoLogo =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='32' fill='%233164FA'/><path d='M32 14 L50 46 H14 Z' fill='white'/></svg>";

export const Default = () => (
    <GukModulesProvider>
        <DaoAvatar name="Patito DAO" />
    </GukModulesProvider>
);

export const Sizes = () => (
    <GukModulesProvider>
        <div className="flex items-end gap-4">
            <DaoAvatar name="Aragon DAO" size="xs" />
            <DaoAvatar name="Aragon DAO" size="sm" />
            <DaoAvatar name="Aragon DAO" size="md" />
            <DaoAvatar name="Aragon DAO" size="lg" />
            <DaoAvatar name="Aragon DAO" size="xl" />
            <DaoAvatar name="Aragon DAO" size="2xl" />
        </div>
    </GukModulesProvider>
);

export const WithLogo = () => (
    <GukModulesProvider>
        <div className="flex items-end gap-4">
            <DaoAvatar name="Builder DAO" size="lg" src={daoLogo} />
            <DaoAvatar name="Builder DAO" size="2xl" src={daoLogo} />
        </div>
    </GukModulesProvider>
);
