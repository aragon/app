import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceNetworkAddress,
    workspaceUtils,
} from './workspaceUtils';

describe('workspace utils', () => {
    const addressOne = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';
    const addressTwo = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    describe('buildAccountId', () => {
        it('builds the account id from the network and the checksummed address', () => {
            const id = workspaceUtils.buildAccountId({
                network: Network.CITREA_MAINNET,
                address: addressOne.toLowerCase(),
            });

            expect(id).toEqual(`citrea-mainnet-${addressOne}`);
        });
    });

    describe('slugify', () => {
        it.each([
            { value: 'Demo Workspace', expected: 'demo-workspace' },
            { value: '  Trailing spaces  ', expected: 'trailing-spaces' },
            { value: 'Aragon / OSx (v2)', expected: 'aragon-osx-v2' },
            { value: '???', expected: 'workspace' },
            { value: '', expected: 'workspace' },
        ])('slugifies "$value" into "$expected"', ({ value, expected }) => {
            expect(workspaceUtils.slugify(value)).toEqual(expected);
        });
    });

    describe('buildWorkspaceId', () => {
        it('returns the slug of the name when not taken', () => {
            expect(workspaceUtils.buildWorkspaceId('Demo Workspace')).toEqual(
                'demo-workspace',
            );
        });

        it('suffixes the slug with the first free index when taken', () => {
            const existingIds = ['demo-workspace', 'demo-workspace-2'];

            expect(
                workspaceUtils.buildWorkspaceId('Demo Workspace', existingIds),
            ).toEqual('demo-workspace-3');
        });
    });

    describe('isSameNetworkAddress', () => {
        it('returns true for the same address on the same network regardless of casing', () => {
            const result = workspaceUtils.isSameNetworkAddress(
                { network: Network.ETHEREUM_MAINNET, address: addressOne },
                {
                    network: Network.ETHEREUM_MAINNET,
                    address: addressOne.toLowerCase(),
                },
            );

            expect(result).toBeTruthy();
        });

        it('returns false for the same address on different networks', () => {
            const result = workspaceUtils.isSameNetworkAddress(
                { network: Network.ETHEREUM_MAINNET, address: addressOne },
                { network: Network.POLYGON_MAINNET, address: addressOne },
            );

            expect(result).toBeFalsy();
        });
    });

    describe('validateNetworkAddress', () => {
        it('returns an error when the address is not valid', () => {
            const networkAddresses = [
                { network: Network.ETHEREUM_MAINNET, address: '0x123' },
            ];

            expect(
                workspaceUtils.validateNetworkAddress(networkAddresses, 0),
            ).toEqual('app.workspace.createWorkspaceForm.error.invalidAddress');
        });

        it('returns an error when the network and address pair is already used by a previous entry', () => {
            const networkAddresses = [
                { network: Network.ETHEREUM_MAINNET, address: addressOne },
                {
                    network: Network.ETHEREUM_MAINNET,
                    address: addressOne.toLowerCase(),
                },
            ];

            expect(
                workspaceUtils.validateNetworkAddress(networkAddresses, 1),
            ).toEqual(
                'app.workspace.createWorkspaceForm.error.duplicateAddress',
            );
        });

        it('returns true for the same address used on a different network', () => {
            const networkAddresses = [
                { network: Network.ETHEREUM_MAINNET, address: addressOne },
                { network: Network.POLYGON_MAINNET, address: addressOne },
            ];

            expect(
                workspaceUtils.validateNetworkAddress(networkAddresses, 1),
            ).toBeTruthy();
        });

        it('returns an error instead of throwing when the list is not set yet', () => {
            // The field validator reads the list off the live form state, which is undefined until the
            // field-array is seeded.
            expect(workspaceUtils.validateNetworkAddress(undefined, 0)).toEqual(
                'app.workspace.createWorkspaceForm.error.invalidAddress',
            );
        });

        it('returns an error instead of throwing when the index is out of range', () => {
            expect(workspaceUtils.validateNetworkAddress([], 0)).toEqual(
                'app.workspace.createWorkspaceForm.error.invalidAddress',
            );
        });

        it('ignores empty slots of a partially filled list', () => {
            const networkAddresses = [
                undefined,
                { network: Network.ETHEREUM_MAINNET, address: addressOne },
            ] as unknown as IWorkspaceNetworkAddress[];

            expect(
                workspaceUtils.validateNetworkAddress(networkAddresses, 1),
            ).toBeTruthy();
        });

        it('returns true for distinct valid addresses', () => {
            const networkAddresses = [
                { network: Network.ETHEREUM_MAINNET, address: addressOne },
                { network: Network.ETHEREUM_MAINNET, address: addressTwo },
            ];

            expect(
                workspaceUtils.validateNetworkAddress(networkAddresses, 1),
            ).toBeTruthy();
        });
    });
});
