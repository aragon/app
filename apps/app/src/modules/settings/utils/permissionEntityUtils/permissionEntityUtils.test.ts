import { addressUtils } from '@aragon/gov-ui-kit';
import {
    type IDaoPlugin,
    type IPermissionEntityRef,
    PermissionEntityExternalBrandId,
} from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import {
    type IPermissionAccountRef,
    type IPermissionEntity,
    permissionEntityUtils,
} from './permissionEntityUtils';

interface ISafeBrandCase {
    name: string;
    label: string;
    layer: IPermissionEntityRef['layer'];
}

interface IProcessBodyNameCase {
    name: string;
    label: string;
    interfaceType: string;
    expected: { label: string; tag: string | undefined; detailName: string };
}

describe('permissionEntity Utils', () => {
    describe('resolvePermissionEntity', () => {
        const pluginAddress = '0x1234567890123456789012345678901234567890';
        const daoAddress = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const unknownAddress = '0x000000000000000000000000000000000000dead';

        const daoPlugins = [
            {
                id: 'multisig',
                uniqueId: `${pluginAddress}-multisig`,
                label: 'Multisig',
                meta: {
                    address: pluginAddress,
                    name: 'Multisig',
                    interfaceType: 'multisig',
                    release: '1',
                    build: '2',
                } as IDaoPlugin,
                props: {},
            },
        ] satisfies IFilterComponentPlugin<IDaoPlugin>[];

        const accounts: IPermissionAccountRef[] = [
            { address: daoAddress, name: 'Patito DAO', avatarSrc: undefined },
        ];

        it.each([
            {
                description: 'resolves ANY_ADDR to "Anyone" sentinel',
                address: ANY_ADDR,
                expected: {
                    label: 'Anyone',
                    isSentinel: true,
                    tag: undefined,
                    type: 'sentinel',
                },
            },
            {
                // VRB-2 [S6] guard: this case pins the `.toLowerCase()` calls in
                // `resolvePermissionEntity` — the kit helper checksum-validates
                // before case-folding, so dropping them breaks sentinel matching.
                description: 'resolves ANY_ADDR case-insensitively to "Anyone"',
                address: ANY_ADDR.toUpperCase(),
                expected: {
                    label: 'Anyone',
                    isSentinel: true,
                    tag: undefined,
                    type: 'sentinel',
                },
            },
            {
                description: 'resolves ALLOW_FLAG to "Any Address" sentinel',
                address: ALLOW_FLAG,
                expected: {
                    label: 'Any Address',
                    isSentinel: true,
                    tag: undefined,
                    type: 'sentinel',
                },
            },
            {
                description:
                    'resolves a matching plugin to name + type tag, with the metadata name and version as the detail name',
                address: pluginAddress,
                expected: {
                    label: 'Multisig',
                    detailName: 'Multisig v1.2',
                    isSentinel: false,
                    tag: 'MULTISIG',
                    type: 'plugin',
                },
            },
            {
                description: 'resolves a matching account to its DAO name',
                address: daoAddress,
                expected: {
                    label: 'Patito DAO',
                    isSentinel: false,
                    tag: undefined,
                    type: 'dao',
                },
            },
            {
                description:
                    'falls back to the truncated address for unknown addresses',
                address: unknownAddress,
                expected: {
                    label: addressUtils.truncateAddress(unknownAddress),
                    detailName: addressUtils.truncateAddress(unknownAddress),
                    isSentinel: false,
                    tag: undefined,
                    type: 'address',
                },
            },
        ])('$description', ({ address, expected }) => {
            const result: IPermissionEntity =
                permissionEntityUtils.resolvePermissionEntity(address, {
                    daoPlugins,
                    accounts,
                });

            expect(result.label).toEqual(expected.label);
            expect(result.tag).toEqual(expected.tag);
            expect(result.isSentinel).toEqual(expected.isSentinel);
            expect(result.type).toEqual(expected.type);
            if (expected.detailName != null) {
                expect(result.detailName).toEqual(expected.detailName);
            }
            expect(result.address).toEqual(address);
        });

        it('presents backend-unresolved addresses as their address, not a placeholder label', () => {
            const result = permissionEntityUtils.resolvePermissionEntity(
                unknownAddress,
                {
                    entity: {
                        address: unknownAddress,
                        label: 'Unknown address',
                        layer: 'unknown',
                        status: 'unknown',
                    },
                },
            );

            expect(result).toMatchObject({
                label: addressUtils.truncateAddress(unknownAddress),
                type: 'address',
                layer: 'unknown',
            });
        });

        it('prefers backend-enriched entity metadata over local fallbacks', () => {
            const result = permissionEntityUtils.resolvePermissionEntity(
                unknownAddress,
                {
                    entity: {
                        address: unknownAddress,
                        interfaceType: 'tokenVoting',
                        label: 'Historical Token Voting',
                        layer: 'historicalPlugin',
                        status: 'uninstalled',
                    },
                },
            );

            expect(result).toMatchObject({
                label: 'Historical Token Voting',
                tag: 'TOKENVOTING',
                type: 'plugin',
                detailName: 'Historical Token Voting',
                layer: 'historicalPlugin',
                status: 'uninstalled',
            });
        });

        it('uses the local plugin formatter when a backend plugin label is only the raw interface type', () => {
            const gaugeAddress = '0x8ab7f7b617b5248358ea9c9b728f3c2edbaa97a2';
            const result = permissionEntityUtils.resolvePermissionEntity(
                gaugeAddress,
                {
                    daoPlugins: [
                        {
                            id: 'gauge',
                            uniqueId: `${gaugeAddress}-gauge`,
                            label: 'gauge',
                            meta: {
                                address: gaugeAddress,
                                interfaceType: 'gauge',
                                subdomain: 'citrea-xctr-gauge-voter-0',
                            } as IDaoPlugin,
                            props: {},
                        },
                    ],
                    entity: {
                        address: gaugeAddress,
                        interfaceType: 'gauge',
                        label: 'gauge',
                        layer: 'topLevelPlugin',
                        status: 'installed',
                    },
                },
            );

            expect(result).toMatchObject({
                label: 'Citrea Xctr Gauge Voter 0',
                tag: 'GAUGE',
                type: 'plugin',
                detailName: 'Citrea Xctr Gauge Voter 0',
                layer: 'topLevelPlugin',
            });
        });

        // LBL-1 guard: a recognized Safe brand is hoisted above the backend label,
        // the interface type, and the layer fallbacks — in and out of processInternal.
        it.each<ISafeBrandCase>([
            {
                name: 'identifies a recognized Safe before backend labels or interface types',
                label: 'Treasury signers',
                layer: 'processInternal',
            },
            {
                name: 'identifies a recognized Safe outside the process-internal layer',
                label: 'Backend multisig label',
                layer: 'externalActor',
            },
        ])('$name', ({ label, layer }) => {
            const result = permissionEntityUtils.resolvePermissionEntity(
                unknownAddress,
                {
                    entity: {
                        address: unknownAddress,
                        brandId: PermissionEntityExternalBrandId.SAFE,
                        interfaceType: 'multisig',
                        label,
                        layer,
                        parentPluginName: 'Core Governance',
                    },
                },
            );

            expect(result).toMatchObject({
                brandId: PermissionEntityExternalBrandId.SAFE,
                label: 'Safe',
                tag: undefined,
                type: 'plugin',
                layer,
                // The parent process name describes the body's container, not the
                // address itself, so it must never become the Safe's detail line.
                detailName: 'Safe',
            });
        });

        it.each<IProcessBodyNameCase>([
            {
                name: 'names internal process bodies by their interface type, not the generic layer label',
                label: 'Process internal',
                interfaceType: 'tokenVoting',
                expected: {
                    label: 'Token Voting',
                    tag: undefined,
                    detailName: 'Core Governance',
                },
            },
            {
                name: 'renders internal bodies with the real name and type from the backend label',
                label: 'Founders',
                interfaceType: 'multisig',
                expected: {
                    label: 'Founders',
                    tag: 'MULTISIG',
                    detailName: 'Core Governance',
                },
            },
        ])('$name', ({ label, interfaceType, expected }) => {
            const result = permissionEntityUtils.resolvePermissionEntity(
                unknownAddress,
                {
                    entity: {
                        address: unknownAddress,
                        label,
                        layer: 'processInternal',
                        interfaceType,
                        parentPluginName: 'Core Governance',
                    },
                },
            );

            expect(result).toMatchObject({
                ...expected,
                type: 'plugin',
                layer: 'processInternal',
            });
        });
    });
});
