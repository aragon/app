import { ActionSimulation, GukModulesProvider } from '@aragon/gov-ui-kit';

export const Success = () => (
    <GukModulesProvider>
        <ActionSimulation
            className="flex-1"
            totalActions={3}
            lastSimulation={{
                timestamp: 1698000000000,
                url: 'https://dashboard.tenderly.co/simulation/12345',
                status: 'success',
            }}
        />
    </GukModulesProvider>
);

export const Failed = () => (
    <GukModulesProvider>
        <ActionSimulation
            className="flex-1"
            totalActions={2}
            lastSimulation={{
                timestamp: 1698000000000,
                url: 'https://dashboard.tenderly.co/simulation/12345',
                status: 'failed',
            }}
        />
    </GukModulesProvider>
);

export const Loading = () => (
    <GukModulesProvider>
        <ActionSimulation className="flex-1" totalActions={5} isLoading={true} />
    </GukModulesProvider>
);

export const NoPreviousSimulation = () => (
    <GukModulesProvider>
        <ActionSimulation className="flex-1" totalActions={1} />
    </GukModulesProvider>
);
