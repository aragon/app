import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { daoOptions, daoService, Network } from '@/shared/api/daoService';
import { generateDao, ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { useWorkspaceDaos } from './useWorkspaceDaos';

describe('useWorkspaceDaos hook', () => {
    const getDaoSpy = jest.spyOn(daoService, 'getDao');

    afterEach(() => {
        getDaoSpy.mockReset();
    });

    const generateAccount = (
        account?: Partial<IWorkspaceAccount>,
    ): IWorkspaceAccount => ({
        id: 'ethereum-mainnet-0xDao',
        type: WorkspaceAccountType.DAO,
        address: '0xDao',
        network: Network.ETHEREUM_MAINNET,
        ...account,
    });

    const createWrapper = (client: QueryClient) => {
        const Wrapper = ({ children }: { children?: ReactNode }) => (
            <ReactQueryWrapper client={client}>{children}</ReactQueryWrapper>
        );

        return Wrapper;
    };

    it('reads the DAO of every DAO account and ignores other accounts', async () => {
        const daoAccount = generateAccount();
        const safeAccount = generateAccount({
            id: 'ethereum-mainnet-0xSafe',
            type: WorkspaceAccountType.SAFE,
        });
        const dao = generateDao({ id: daoAccount.id });
        getDaoSpy.mockResolvedValue(dao);

        const { result } = renderHook(
            () => useWorkspaceDaos([daoAccount, safeAccount]),
            { wrapper: createWrapper(new QueryClient()) },
        );

        await waitFor(() => expect(result.current.isPending).toBeFalsy());
        expect(getDaoSpy).toHaveBeenCalledTimes(1);
        expect(getDaoSpy).toHaveBeenCalledWith({
            urlParams: { id: daoAccount.id },
        });
        expect(result.current.daos).toEqual({ [daoAccount.id]: dao });
    });

    it('overrides the DAO metadata with the workspace account metadata without mutating the cached DAO', async () => {
        const metadata = {
            name: 'Workspace name',
            avatar: 'workspace-avatar',
            description: 'Workspace description',
        };
        const account = generateAccount({ metadata });
        const dao = generateDao({
            id: account.id,
            name: 'Indexed name',
            avatar: 'indexed-avatar',
            description: 'Indexed description',
        });
        getDaoSpy.mockResolvedValue(dao);
        const client = new QueryClient();

        const { result } = renderHook(() => useWorkspaceDaos([account]), {
            wrapper: createWrapper(client),
        });

        await waitFor(() => expect(result.current.isPending).toBeFalsy());
        expect(result.current.daos[account.id]).toEqual({
            ...dao,
            ...metadata,
        });
        expect(
            client.getQueryData(
                daoOptions({ urlParams: { id: account.id } }).queryKey,
            ),
        ).toEqual(
            expect.objectContaining({
                name: 'Indexed name',
                avatar: 'indexed-avatar',
                description: 'Indexed description',
            }),
        );
    });
});
