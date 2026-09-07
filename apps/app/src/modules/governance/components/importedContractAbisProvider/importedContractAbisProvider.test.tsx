import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Network } from '@/shared/api/daoService';
import { generateSmartContractAbi } from '../../testUtils';
import {
    ImportedContractAbisProvider,
    useImportedContractAbis,
} from './importedContractAbisProvider';

describe('ImportedContractAbisProvider', () => {
    const createTestWrapper = () => (props: { children?: ReactNode }) => (
        <ImportedContractAbisProvider>
            {props.children}
        </ImportedContractAbisProvider>
    );

    it('throws error when the hook is used outside the provider', () => {
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => null);
        expect(() => renderHook(() => useImportedContractAbis())).toThrow();
        consoleSpy.mockRestore();
    });

    it('returns the abis imported for the specified network only', () => {
        const mainnetAbi = generateSmartContractAbi({
            address: '0x123',
            network: Network.ETHEREUM_MAINNET,
        });
        const sepoliaAbi = generateSmartContractAbi({
            address: '0x456',
            network: Network.ETHEREUM_SEPOLIA,
        });

        const { result } = renderHook(
            () => useImportedContractAbis(Network.ETHEREUM_MAINNET),
            { wrapper: createTestWrapper() },
        );

        act(() => {
            result.current.addAbi(mainnetAbi);
            result.current.addAbi(sepoliaAbi);
        });

        expect(result.current.abis).toEqual([mainnetAbi]);
    });

    it('returns an empty list when the network is not set', () => {
        const { result } = renderHook(() => useImportedContractAbis(), {
            wrapper: createTestWrapper(),
        });

        act(() =>
            result.current.addAbi(
                generateSmartContractAbi({
                    network: Network.ETHEREUM_MAINNET,
                }),
            ),
        );

        expect(result.current.abis).toEqual([]);
    });

    it('ignores contracts already imported for the same network', () => {
        const abi = generateSmartContractAbi({
            address: '0xaBc0000000000000000000000000000000000001',
            network: Network.ETHEREUM_MAINNET,
        });
        const duplicateAbi = generateSmartContractAbi({
            address: abi.address.toLowerCase(),
            network: Network.ETHEREUM_MAINNET,
        });

        const { result } = renderHook(
            () => useImportedContractAbis(Network.ETHEREUM_MAINNET),
            { wrapper: createTestWrapper() },
        );

        act(() => {
            result.current.addAbi(abi);
            result.current.addAbi(duplicateAbi);
        });

        expect(result.current.abis).toEqual([abi]);
    });
});
