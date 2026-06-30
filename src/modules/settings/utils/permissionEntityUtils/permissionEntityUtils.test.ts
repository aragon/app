import { addressUtils } from '@aragon/gov-ui-kit';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import {
    type IPermissionEntity,
    permissionEntityUtils,
} from './permissionEntityUtils';

describe('permissionEntity Utils', () => {
    describe('resolvePermissionEntity', () => {
        const pluginAddress = '0x1234567890123456789012345678901234567890';
        const unknownAddress = '0x000000000000000000000000000000000000dead';

        const daoPlugins = [
            {
                id: 'multisig',
                uniqueId: `${pluginAddress}-multisig`,
                label: 'Multisig',
                meta: {
                    address: pluginAddress,
                    name: 'Multisig',
                } as IDaoPlugin,
                props: {},
            },
        ] satisfies IFilterComponentPlugin<IDaoPlugin>[];

        it.each([
            {
                description: 'resolves ANY_ADDR to "Anyone" sentinel',
                address: ANY_ADDR,
                expected: { label: 'Anyone', isSentinel: true, tag: undefined },
            },
            {
                description: 'resolves ANY_ADDR case-insensitively to "Anyone"',
                address: ANY_ADDR.toUpperCase(),
                expected: { label: 'Anyone', isSentinel: true, tag: undefined },
            },
            {
                description: 'resolves ALLOW_FLAG to "Any Address" sentinel',
                address: ALLOW_FLAG,
                expected: {
                    label: 'Any Address',
                    isSentinel: true,
                    tag: undefined,
                },
            },
            {
                description: 'resolves a matching plugin address to its tag',
                address: pluginAddress,
                expected: {
                    label: 'Multisig',
                    isSentinel: false,
                    tag: 'Multisig',
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
                },
            },
        ])('$description', ({ address, expected }) => {
            const result: IPermissionEntity =
                permissionEntityUtils.resolvePermissionEntity(
                    address,
                    daoPlugins,
                );

            expect(result.label).toEqual(expected.label);
            expect(result.tag).toEqual(expected.tag);
            expect(result.isSentinel).toEqual(expected.isSentinel);
            expect(result.address).toEqual(address);
        });
    });
});
