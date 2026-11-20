import { featureFlags as singletonFeatureFlags } from './featureFlags';
import type {
    FeatureFlagDefinition,
    FeatureFlagEnvironment,
    FeatureFlagKey,
    FeatureFlagOverrides,
    FeatureFlagSnapshot,
    IFeatureFlagsProvider,
} from './featureFlags.api';
import { FEATURE_FLAG_DEFINITIONS } from './featureFlags.constants';

interface FeatureFlagsService {
    isEnabled: (key: FeatureFlagKey) => Promise<boolean>;
    getSnapshot: () => Promise<FeatureFlagSnapshot[]>;
}

class TestProvider implements IFeatureFlagsProvider {
    constructor(
        private readonly implementation: () => Promise<FeatureFlagOverrides>,
        private readonly baseOverrides: FeatureFlagOverrides = {},
    ) {}

    loadOverrides = jest.fn(() => this.implementation());

    loadBaseOverrides = jest.fn(() => Promise.resolve(this.baseOverrides));
}

const createService = (params: {
    overrides: FeatureFlagOverrides | Error;
    baseOverrides?: FeatureFlagOverrides;
    environment?: FeatureFlagEnvironment;
    definitions?: FeatureFlagDefinition[];
}) => {
    const {
        overrides,
        baseOverrides,
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
        baseOverrides,
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
        key: 'linkedAccount',
        name: 'Linked account support',
        description: 'Enables linked account features.',
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
            overrides: { debugPanel: true, linkedAccount: false },
        });

        const isDebugEnabled = await service.isEnabled('debugPanel');
        const isLinkedAccountEnabled = await service.isEnabled('linkedAccount');

        expect(provider.loadOverrides).toHaveBeenCalled();
        expect(isDebugEnabled).toBe(true);
        expect(isLinkedAccountEnabled).toBe(false);
    });

    it('falls back to static environment/default values when no overrides are present', async () => {
        const { service } = createService({
            overrides: {},
        });

        const snapshot = await service.getSnapshot();
        const debugPanel = snapshot.find((flag) => flag.key === 'debugPanel');
        const linkedAccount = snapshot.find(
            (flag) => flag.key === 'linkedAccount',
        );

        expect(debugPanel?.enabled).toBe(true); // local env override
        expect(linkedAccount?.enabled).toBe(false); // all false in config
    });

    describe('occ environment', () => {
        const isEnabledIn = (
            environment: FeatureFlagEnvironment,
            environments: FeatureFlagDefinition['environments'],
            overrides: FeatureFlagOverrides = {},
            baseOverrides: FeatureFlagOverrides = {},
        ) => {
            const { service } = createService({
                overrides,
                baseOverrides,
                environment,
                definitions: [
                    {
                        key: 'debugPanel',
                        name: 'Debug panel',
                        description: 'Enables debug panel.',
                        defaultValue: false,
                        environments,
                    },
                ],
            });

            return service.isEnabled('debugPanel');
        };

        it('takes the production value when occ has none', async () => {
            expect(await isEnabledIn('occ', { production: true })).toBe(true);
        });

        it('prefers the explicit occ value over production', async () => {
            expect(
                await isEnabledIn('occ', { occ: false, production: true }),
            ).toBe(false);
            expect(
                await isEnabledIn('occ', { occ: true, production: false }),
            ).toBe(true);
        });

        it('ranks the code value of occ above the CMS value of production', async () => {
            expect(
                await isEnabledIn(
                    'occ',
                    { occ: true },
                    {},
                    { debugPanel: false },
                ),
            ).toBe(true);
        });

        it('ranks the CMS value of occ above the code value of production', async () => {
            expect(
                await isEnabledIn(
                    'occ',
                    { production: true },
                    { debugPanel: false },
                ),
            ).toBe(false);
        });

        it('takes the CMS value of production when the code has none', async () => {
            expect(await isEnabledIn('occ', {}, {}, { debugPanel: true })).toBe(
                true,
            );
        });

        it('ranks the CMS value of production above the code value of production', async () => {
            expect(
                await isEnabledIn(
                    'occ',
                    { production: true },
                    {},
                    { debugPanel: false },
                ),
            ).toBe(false);
        });

        it('keeps the code value of an environment without a base above any base overrides', async () => {
            expect(
                await isEnabledIn(
                    'production',
                    { production: true },
                    {},
                    { debugPanel: false },
                ),
            ).toBe(true);
        });

        it('lets overrides win over the occ and production values', async () => {
            expect(
                await isEnabledIn(
                    'occ',
                    { production: true },
                    { debugPanel: false },
                ),
            ).toBe(false);
        });

        it('does not make other environments inherit the production value', async () => {
            expect(await isEnabledIn('staging', { production: true })).toBe(
                false,
            );
            expect(await isEnabledIn('preview', { production: true })).toBe(
                false,
            );
        });

        it('resolves the real definitions in occ as production plus the workspaces flag', async () => {
            const occ = createService({
                overrides: {},
                environment: 'occ',
                definitions: FEATURE_FLAG_DEFINITIONS,
            });
            const production = createService({
                overrides: {},
                environment: 'production',
                definitions: FEATURE_FLAG_DEFINITIONS,
            });

            const occSnapshot = await occ.service.getSnapshot();
            const productionSnapshot = await production.service.getSnapshot();
            const getEnabled = (snapshot: FeatureFlagSnapshot[]) =>
                Object.fromEntries(
                    snapshot.map((flag) => [flag.key, flag.enabled]),
                );

            expect(getEnabled(occSnapshot)).toEqual({
                ...getEnabled(productionSnapshot),
                workspaces: true,
            });
            expect(getEnabled(occSnapshot).workspaces).toBe(true);
            expect(getEnabled(occSnapshot).debugPanel).toBe(false);
            expect(getEnabled(occSnapshot).useMocks).toBe(false);
            expect(getEnabled(productionSnapshot).workspaces).toBe(false);
        });
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
