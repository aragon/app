import { addressUtils } from '@aragon/gov-ui-kit';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import {
    type IPermissionAccountRef,
    type IPermissionEntity,
    permissionEntityUtils,
} from './permissionEntityUtils';

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
                description: 'resolves a matching plugin to name + type tag',
                address: pluginAddress,
                expected: {
                    label: 'Multisig',
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
                    'falls back to an unresolved label for unknown addresses',
                address: unknownAddress,
                expected: {
                    label: 'Unknown address',
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

        it('includes the plugin metadata name and version as the detail name', () => {
            const result = permissionEntityUtils.resolvePermissionEntity(
                pluginAddress,
                { daoPlugins },
            );

            expect(result.detailName).toEqual('Multisig v1.2');
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

        it('surfaces backend Safe brand metadata for process bodies', () => {
            const result = permissionEntityUtils.resolvePermissionEntity(
                unknownAddress,
                {
                    entity: {
                        address: unknownAddress,
                        label: 'Process internal',
                        layer: 'processInternal',
                        brandId: 'safe',
                        proposalCreationConditionAddress:
                            '0x00000000000000000000000000000000c0ffee00',
                    },
                },
            );

            expect(result).toMatchObject({
                brandId: 'safe',
                type: 'plugin',
                layer: 'processInternal',
            });
        });

        it('names internal process bodies by their interface type, not the generic layer label', () => {
            const result = permissionEntityUtils.resolvePermissionEntity(
                unknownAddress,
                {
                    entity: {
                        address: unknownAddress,
                        label: 'Process internal',
                        layer: 'processInternal',
                        interfaceType: 'tokenVoting',
                        parentPluginName: 'Core Governance',
                    },
                },
            );

            expect(result).toMatchObject({
                label: 'Token Voting',
                type: 'plugin',
                layer: 'processInternal',
                detailName: 'Core Governance',
            });
            expect(result.tag).toBeUndefined();
        });

        it('renders internal bodies with the real name and type from the backend label', () => {
            const result = permissionEntityUtils.resolvePermissionEntity(
                unknownAddress,
                {
                    entity: {
                        address: unknownAddress,
                        label: 'Founders',
                        layer: 'processInternal',
                        interfaceType: 'multisig',
                        parentPluginName: 'Core Governance',
                    },
                },
            );

            expect(result).toMatchObject({
                label: 'Founders',
                tag: 'MULTISIG',
                type: 'plugin',
                layer: 'processInternal',
            });
        });
    });
});
