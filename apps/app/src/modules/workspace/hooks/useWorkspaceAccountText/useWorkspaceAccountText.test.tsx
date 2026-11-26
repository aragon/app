import { AddressResolutionProvider, addressEntryKey } from '@aragon/gov-ui-kit';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { useWorkspaceAccountText } from './useWorkspaceAccountText';

describe('useWorkspaceAccountText hook', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const account: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${address}`,
        type: WorkspaceAccountType.SAFE,
        address,
        network: Network.ETHEREUM_SEPOLIA,
    };
    const chainId = networkDefinitions[Network.ETHEREUM_SEPOLIA].id;

    const wrapper = ({ children }: { children: ReactNode }) => (
        <AddressResolutionProvider
            entries={
                new Map([
                    [
                        addressEntryKey(address, chainId),
                        { label: 'Ops wallet', source: 'workspace' as const },
                    ],
                ])
            }
        >
            {children}
        </AddressResolutionProvider>
    );

    it('prefers the name of the account', () => {
        const { result } = renderHook(
            () => useWorkspaceAccountText({ name: 'Treasury', account }),
            { wrapper },
        );

        expect(result.current).toBe('Treasury');
    });

    it('reads the address book name of an unnamed account, on its network', () => {
        const { result } = renderHook(
            () => useWorkspaceAccountText({ account }),
            { wrapper },
        );

        expect(result.current).toBe('Ops wallet');
    });

    it('falls back to the short address with no name', () => {
        const { result } = renderHook(() =>
            useWorkspaceAccountText({ account }),
        );

        expect(result.current).toBe('0xE8fd…0De5');
    });

    it('uses the fallback when there is no account', () => {
        const { result } = renderHook(() =>
            useWorkspaceAccountText({ fallback: 'All accounts' }),
        );

        expect(result.current).toBe('All accounts');
    });
});
