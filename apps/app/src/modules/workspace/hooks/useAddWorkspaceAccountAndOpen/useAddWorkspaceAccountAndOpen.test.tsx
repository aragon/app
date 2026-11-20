import { QueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import type { ReactNode } from 'react';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import { useAddWorkspaceAccountAndOpen } from './useAddWorkspaceAccountAndOpen';

describe('useAddWorkspaceAccountAndOpen hook', () => {
    const addWorkspaceAccountSpy = jest.spyOn(
        workspaceService,
        'addWorkspaceAccount',
    );
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const pushMock = jest.fn();

    beforeEach(() => {
        useRouterSpy.mockReturnValue({
            push: pushMock,
        } as unknown as AppRouterInstance);
    });

    afterEach(() => {
        addWorkspaceAccountSpy.mockReset();
        useRouterSpy.mockReset();
        pushMock.mockReset();
    });

    const account: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5`,
        type: WorkspaceAccountType.DAO,
        address: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
        network: Network.ETHEREUM_SEPOLIA,
    };

    it('adds the account, refreshes the workspace, then opens its overview', async () => {
        addWorkspaceAccountSpy.mockResolvedValue({} as IWorkspace);
        const client = new QueryClient();
        const invalidateSpy = jest.spyOn(client, 'invalidateQueries');
        const wrapper = ({ children }: { children?: ReactNode }) => (
            <ReactQueryWrapper client={client}>{children}</ReactQueryWrapper>
        );
        const { result } = renderHook(
            () => useAddWorkspaceAccountAndOpen('demo'),
            { wrapper },
        );

        await result.current(account);

        expect(addWorkspaceAccountSpy).toHaveBeenCalledWith({
            urlParams: { id: 'demo' },
            body: { account },
        });
        expect(invalidateSpy).toHaveBeenCalledWith({
            queryKey: workspaceServiceKeys.workspace({
                urlParams: { id: 'demo' },
            }),
        });
        expect(invalidateSpy).toHaveBeenCalledWith({
            queryKey: workspaceServiceKeys.workspaceList(),
        });
        expect(pushMock).toHaveBeenCalledWith(
            `/workspace/demo/${account.id}/overview`,
        );
    });
});
