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
                    'falls back to a truncated address for unknown addresses',
                address: unknownAddress,
                expected: {
                    label: addressUtils.truncateAddress(unknownAddress),
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
            expect(result.address).toEqual(address);
        });

        it('includes the plugin metadata name and version as the detail name', () => {
            const result = permissionEntityUtils.resolvePermissionEntity(
                pluginAddress,
                { daoPlugins },
            );

            expect(result.detailName).toEqual('Multisig v1.2');
        });
    });
});
