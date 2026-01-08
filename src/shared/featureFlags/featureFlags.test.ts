import { featureFlags as singletonFeatureFlags } from './featureFlags';
import type {
    FeatureFlagDefinition,
    FeatureFlagEnvironment,
    FeatureFlagKey,
    FeatureFlagOverrides,
    FeatureFlagSnapshot,
    IFeatureFlagsProvider,
} from './featureFlags.api';

interface FeatureFlagsService {
    isEnabled: (key: FeatureFlagKey) => Promise<boolean>;
    getSnapshot: () => Promise<FeatureFlagSnapshot[]>;
}

class TestProvider implements IFeatureFlagsProvider {
    constructor(
        private readonly implementation: () => Promise<FeatureFlagOverrides>,
    ) {}

    loadOverrides = jest.fn(() => this.implementation());
}

const createService = (params: {
    overrides: FeatureFlagOverrides | Error;
    environment?: FeatureFlagEnvironment;
    definitions?: FeatureFlagDefinition[];
}) => {
    const {
        overrides,
        environment = 'local',
        definitions = defaultDefinitions,
    } = params;

    const FeatureFlagsClass = singletonFeatureFlags.constructor as new (
        provider: IFeatureFlagsProvider,
        definitions: FeatureFlagDefinition[],
        environment: FeatureFlagEnvironment,
    ) => FeatureFlagsService;

    const provider = new TestProvider(
        overrides instanceof Error
            ? () => Promise.reject<FeatureFlagOverrides>(overrides)
            : () => Promise.resolve<FeatureFlagOverrides>(overrides),
    );

    const service = new FeatureFlagsClass(provider, definitions, environment);

    return { service, provider, definitions };
};

const defaultDefinitions: FeatureFlagDefinition[] = [
    {
        key: 'debugPanel',
        name: 'Debug panel',
        description: 'Enables debug panel.',
        defaultValue: false,
        environments: {
            local: true,
            production: false,
        },
    },
    {
        key: 'subDao',
        name: 'SubDAO support',
        description: 'Enables SubDAO features.',
        defaultValue: false,
        environments: {
            local: false,
            production: false,
        },
    },
];

describe('FeatureFlags service', () => {
    it('uses overrides when they are provided by the provider', async () => {
        const { service, provider } = createService({
            overrides: { debugPanel: true, subDao: false },
        });

        const isDebugEnabled = await service.isEnabled('debugPanel');
        const isSubDaoEnabled = await service.isEnabled('subDao');

        expect(provider.loadOverrides).toHaveBeenCalled();
        expect(isDebugEnabled).toBe(true);
        expect(isSubDaoEnabled).toBe(false);
    });

    it('falls back to static environment/default values when no overrides are present', async () => {
        const { service } = createService({
            overrides: {},
        });

        const snapshot = await service.getSnapshot();
        const debugPanel = snapshot.find((flag) => flag.key === 'debugPanel');
        const subDao = snapshot.find((flag) => flag.key === 'subDao');

        expect(debugPanel?.enabled).toBe(true); // local env override
        expect(subDao?.enabled).toBe(false); // all false in config
    });

    it('returns false for unknown feature flag keys', async () => {
        const { service } = createService({
            overrides: {},
        });

        // Cast to bypass the strict key type; runtime behaviour should be safe.
        const result = await service.isEnabled(
            'nonExistingFlag' as FeatureFlagKey,
        );

        expect(result).toBe(false);
    });

    it('treats flags as disabled when provider throws in isEnabled', async () => {
        const { service } = createService({
            overrides: new Error('provider failure'),
        });

        const isDebugEnabled = await service.isEnabled('debugPanel');

        expect(isDebugEnabled).toBe(false);
    });

    it('returns a conservative snapshot with all flags disabled when provider throws', async () => {
        const { service, definitions } = createService({
            overrides: new Error('provider failure'),
        });

        const snapshot = await service.getSnapshot();

        expect(snapshot).toHaveLength(definitions.length);
        expect(snapshot.every((flag) => !flag.enabled)).toBe(true);
    });
});
