import { addressUtils } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import * as NextNavigation from 'next/navigation';
import type { ReactNode } from 'react';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import { useWorkspaceAccountOptions } from './useWorkspaceAccountOptions';

describe('useWorkspaceAccountOptions hook', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');
    const useParamsSpy = jest.spyOn(NextNavigation, 'useParams');

    const daoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${daoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: daoAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const safeAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${safeAddress}`,
        type: WorkspaceAccountType.SAFE,
        address: safeAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => ({
        id: 'demo',
        name: 'Test Workspace',
        description: '',
        avatar: null,
        links: [],
        accounts: [daoAccount, safeAccount],
        targets: [],
        ...workspace,
    });

    beforeEach(() => {
        useParamsSpy.mockReturnValue({ workspaceId: 'demo', accountId: 'all' });
        getWorkspaceSpy.mockResolvedValue(buildWorkspace());
        getAccountsSpy.mockResolvedValue([
            {
                network: Network.ETHEREUM_SEPOLIA,
                address: daoAddress,
                type: WorkspaceAccountInfoType.DAO,
                status: WorkspaceAccountInfoStatus.AVAILABLE,
                indexed: true,
                name: 'Demo DAO',
            },
        ]);
    });

    afterEach(() => {
        useParamsSpy.mockReset();
        getWorkspaceSpy.mockReset();
        getAccountsSpy.mockReset();
    });

    const renderTestHook = () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <ReactQueryWrapper client={new QueryClient()}>
                {children}
            </ReactQueryWrapper>
        );

        return renderHook(() => useWorkspaceAccountOptions(), { wrapper });
    };

    it('offers the aggregated option first, followed by every account of the workspace', async () => {
        const { result } = renderTestHook();

        await waitFor(() => expect(result.current.options).toHaveLength(3));
        const [allOption, daoOption, safeOption] = result.current.options;
        expect(allOption.isAllAccounts).toBeTruthy();
        expect(daoOption.id).toEqual(daoAccount.id);
        expect(safeOption.id).toEqual(safeAccount.id);
    });

    it('builds an option for a Safe account', async () => {
        const { result } = renderTestHook();

        await waitFor(() => expect(result.current.options).toHaveLength(3));
        const safeOption = result.current.options.find(
            (option) => option.id === safeAccount.id,
        );
        expect(safeOption?.account?.type).toEqual(WorkspaceAccountType.SAFE);
        expect(safeOption?.isAllAccounts).toBeFalsy();
    });

    it('labels a Safe by its registry name', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({
                accounts: [
                    daoAccount,
                    { ...safeAccount, metadata: { name: 'Treasury Safe' } },
                ],
            }),
        );
        const { result } = renderTestHook();

        await waitFor(() =>
            expect(result.current.options[2]?.label).toEqual('Treasury Safe'),
        );
    });

    it('labels an unnamed Safe by its truncated address', async () => {
        const { result } = renderTestHook();

        await waitFor(() => expect(result.current.options).toHaveLength(3));
        expect(result.current.options[2].label).toEqual(
            addressUtils.truncateAddress(safeAddress),
        );
    });

    it('labels a DAO account with the name resolved by the accounts API', async () => {
        const { result } = renderTestHook();

        await waitFor(() =>
            expect(result.current.options[1]?.label).toEqual('Demo DAO'),
        );
    });

    it('reads the aggregated segment of the route as every account', async () => {
        const { result } = renderTestHook();

        await waitFor(() => expect(result.current.options).toHaveLength(3));
        expect(result.current.accountId).toEqual('all');
        expect(result.current.isAllAccounts).toBeTruthy();
        expect(result.current.activeOption?.isAllAccounts).toBeTruthy();
    });

    it('reads the account of the route as the active option', async () => {
        useParamsSpy.mockReturnValue({
            workspaceId: 'demo',
            accountId: daoAccount.id,
        });
        const { result } = renderTestHook();

        await waitFor(() =>
            expect(result.current.activeOption?.id).toEqual(daoAccount.id),
        );
        expect(result.current.isAllAccounts).toBeFalsy();
    });

    it('resolves the aggregated option for the all-accounts segment', async () => {
        const { result } = renderTestHook();

        await waitFor(() => expect(result.current.options).toHaveLength(3));
        expect(result.current.activeOption?.isAllAccounts).toBeTruthy();
        expect(result.current.activeOption?.account).toBeUndefined();
    });

    it('resolves the active option of a Safe account', async () => {
        useParamsSpy.mockReturnValue({
            workspaceId: 'demo',
            accountId: safeAccount.id,
        });
        const { result } = renderTestHook();

        await waitFor(() =>
            expect(result.current.activeOption?.id).toEqual(safeAccount.id),
        );
    });

    // `LayoutWorkspaceAccount` accepts any casing while stored IDs are checksummed, so this must not widen to "none".
    it('resolves the active option for a lowercased account segment', async () => {
        const lowercased = `${Network.ETHEREUM_SEPOLIA}-${safeAddress.toLowerCase()}`;
        useParamsSpy.mockReturnValue({
            workspaceId: 'demo',
            accountId: lowercased,
        });
        const { result } = renderTestHook();

        await waitFor(() =>
            expect(result.current.activeOption?.id).toEqual(safeAccount.id),
        );
        expect(result.current.accountId).toEqual(lowercased);
    });

    it('aggregates on a route with no account segment', async () => {
        useParamsSpy.mockReturnValue({ workspaceId: 'demo' });
        const { result } = renderTestHook();

        await waitFor(() => expect(result.current.options).toHaveLength(3));
        expect(result.current.accountId).toEqual('all');
        expect(result.current.isAllAccounts).toBeTruthy();
    });

    // What is being looked at is not the same question as what can be switched to: the route can name an account
    // the workspace does not hold, and that must not silently read as the aggregated option.
    it('resolves no active option for an account the workspace does not hold, keeping the route account', async () => {
        const foreignAccountId = `${Network.ETHEREUM_SEPOLIA}-0x1111111111111111111111111111111111111111`;
        useParamsSpy.mockReturnValue({
            workspaceId: 'demo',
            accountId: foreignAccountId,
        });
        const { result } = renderTestHook();

        await waitFor(() => expect(result.current.options).toHaveLength(3));
        expect(result.current.accountId).toEqual(foreignAccountId);
        expect(result.current.activeOption).toBeUndefined();
        expect(result.current.isAllAccounts).toBeFalsy();
    });

    it('does not resolve account names for a workspace that has none', async () => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace({ accounts: [] }));
        const { result } = renderTestHook();

        await waitFor(() => expect(result.current.options).toHaveLength(1));
        expect(getAccountsSpy).not.toHaveBeenCalled();
    });
});
