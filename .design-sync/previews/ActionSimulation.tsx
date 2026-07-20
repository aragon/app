import { ActionSimulation, GukModulesProvider } from '@aragon/gov-ui-kit';

export const Success = () => (
    <GukModulesProvider>
        <ActionSimulation
            className="flex-1"
            lastSimulation={{
                timestamp: 1_698_000_000_000,
                url: 'https://dashboard.tenderly.co/simulation/12345',
                status: 'success',
            }}
            totalActions={3}
        />
    </GukModulesProvider>
);

export const Failed = () => (
    <GukModulesProvider>
        <ActionSimulation
            className="flex-1"
            lastSimulation={{
                timestamp: 1_698_000_000_000,
                url: 'https://dashboard.tenderly.co/simulation/12345',
                status: 'failed',
            }}
            totalActions={2}
        />
    </GukModulesProvider>
);

export const Loading = () => (
    <GukModulesProvider>
        <ActionSimulation
            className="flex-1"
            isLoading={true}
            totalActions={5}
        />
    </GukModulesProvider>
);

export const NoPreviousSimulation = () => (
    <GukModulesProvider>
        <ActionSimulation className="flex-1" totalActions={1} />
    </GukModulesProvider>
);
