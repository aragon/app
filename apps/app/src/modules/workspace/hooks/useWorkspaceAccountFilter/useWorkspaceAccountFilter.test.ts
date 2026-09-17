import { addressUtils } from '@aragon/gov-ui-kit';
import { renderHook } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceAccountInfo,
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
} from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import {
    useWorkspaceAccountFilter,
    workspaceAllAccountsOption,
} from './useWorkspaceAccountFilter';

describe('useWorkspaceAccountFilter hook', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const buildAccount = (
        account?: Partial<IWorkspaceAccount>,
    ): IWorkspaceAccount => ({
        id: `ethereum-sepolia-${daoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: daoAddress,
        network: Network.ETHEREUM_SEPOLIA,
        ...account,
    });

    const buildAccountInfo = (
        accountInfo?: Partial<IWorkspaceAccountInfo>,
    ): IWorkspaceAccountInfo => ({
        network: Network.ETHEREUM_SEPOLIA,
        address: daoAddress,
        type: WorkspaceAccountInfoType.DAO,
        status: WorkspaceAccountInfoStatus.AVAILABLE,
        indexed: true,
        ...accountInfo,
    });

    const renderFilter = (
        params?: Partial<Parameters<typeof useWorkspaceAccountFilter>[0]>,
    ) =>
        renderHook(() =>
            useWorkspaceAccountFilter({
                allAccountsLabel: 'All assets',
                ...params,
            }),
        );

    it('always offers the aggregated option first and selects it by default', () => {
        const { result } = renderFilter({ accounts: [buildAccount()] });

        expect(result.current.options[0].id).toEqual(
            workspaceAllAccountsOption,
        );
        expect(result.current.options[0].label).toEqual('All assets');
        expect(result.current.activeOption?.isAllAccounts).toBeTruthy();
    });

    it('gives a tab to DAO accounts only, a Safe cannot be served by the single DAO endpoints', () => {
        const accounts = [
            buildAccount(),
            buildAccount({
                id: `ethereum-sepolia-${safeAddress}`,
                type: WorkspaceAccountType.SAFE,
                address: safeAddress,
            }),
        ];

        const { result } = renderFilter({ accounts });

        expect(result.current.options).toHaveLength(2);
        expect(result.current.options[1].account?.address).toEqual(daoAddress);
    });

    it('labels a tab with the name resolved by the accounts API', () => {
        const { result } = renderFilter({
            accounts: [buildAccount()],
            accountInfos: [buildAccountInfo({ name: 'Demo DAO' })],
        });

        expect(result.current.options[1].label).toEqual('Demo DAO');
    });

    it('prefers the account metadata name over the resolved one', () => {
        const { result } = renderFilter({
            accounts: [buildAccount({ metadata: { name: 'Main treasury' } })],
            accountInfos: [buildAccountInfo({ name: 'Demo DAO' })],
        });

        expect(result.current.options[1].label).toEqual('Main treasury');
    });

    it('falls back to the truncated address when nothing names the account', () => {
        const { result } = renderFilter({ accounts: [buildAccount()] });

        expect(result.current.options[1].label).toEqual(
            addressUtils.truncateAddress(daoAddress),
        );
    });
});
