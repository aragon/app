import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import { StrictMode } from 'react';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    workspaceService,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import { WorkspaceDemoPageClient } from './workspaceDemoPageClient';

describe('<WorkspaceDemoPageClient /> component', () => {
    const importRegistrySpy = jest.spyOn(
        workspaceService,
        'importWorkspaceRegistry',
    );
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const replaceMock = jest.fn();

    beforeEach(() => {
        useRouterSpy.mockReturnValue({
            replace: replaceMock,
        } as unknown as AppRouterInstance);
    });

    afterEach(() => {
        importRegistrySpy.mockReset();
        useRouterSpy.mockReset();
        replaceMock.mockReset();
    });

    const createTestComponent = (queryClient = new QueryClient()) => (
        <ReactQueryWrapper client={queryClient}>
            <WorkspaceDemoPageClient />
        </ReactQueryWrapper>
    );

    it('merges the Aragon fixture and opens it through the regular workspace route', async () => {
        importRegistrySpy.mockResolvedValue([]);

        render(createTestComponent());

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        await waitFor(() =>
            expect(replaceMock).toHaveBeenCalledWith(
                '/workspace/aragon-demo/all/overview',
            ),
        );
        const [rawFixture, merge] = importRegistrySpy.mock.calls[0];
        const fixture = JSON.parse(rawFixture);
        expect(merge).toBe(true);
        expect(
            fixture['aragon-demo'].accounts.map(
                (account: { address: string }) => account.address,
            ),
        ).toEqual([
            '0x9c25a6b1bf3F6Fd2F68a62169c043045C2460482',
            '0x311Ff044882bf953cA3A70867f5B1836C2a9b76B',
        ]);
        expect(
            fixture['cryptex-demo'].accounts.map(
                (account: { address: string }) => account.address,
            ),
        ).toEqual([
            '0xf204245b0B05E9A0780761E326552A569c1D6ceb',
            '0x311Ff044882bf953cA3A70867f5B1836C2a9b76B',
        ]);
    });

    it('installs once when Strict Mode re-runs the effect', async () => {
        importRegistrySpy.mockResolvedValue([]);

        render(<StrictMode>{createTestComponent()}</StrictMode>);

        await waitFor(() => expect(replaceMock).toHaveBeenCalled());
        expect(importRegistrySpy).toHaveBeenCalledTimes(1);
        expect(replaceMock).toHaveBeenCalledTimes(1);
    });

    it('marks every cached imported workspace stale before navigating', async () => {
        const queryClient = new QueryClient();
        const queryKeys = [
            workspaceServiceKeys.workspaceList(),
            ...['aragon-demo', 'cryptex-demo'].map((id) =>
                workspaceServiceKeys.workspace({ urlParams: { id } }),
            ),
        ];
        for (const queryKey of queryKeys) {
            queryClient.setQueryData(queryKey, { stale: 'workspace data' });
        }
        importRegistrySpy.mockResolvedValue([]);

        render(createTestComponent(queryClient));

        await waitFor(() => expect(replaceMock).toHaveBeenCalled());
        for (const queryKey of queryKeys) {
            expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(
                true,
            );
        }
    });

    it('shows an error instead of navigating when the fixture cannot be installed', async () => {
        importRegistrySpy.mockRejectedValue(new Error('Storage unavailable'));

        render(createTestComponent());

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'app.workspace.demo.error',
        );
        expect(replaceMock).not.toHaveBeenCalled();
    });
});
