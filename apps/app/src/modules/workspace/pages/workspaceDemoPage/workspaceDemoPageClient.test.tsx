import { render, screen, waitFor } from '@testing-library/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import { workspaceService } from '../../api/workspaceService';
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

    it('merges the Aragon fixture and opens it through the regular workspace route', async () => {
        importRegistrySpy.mockResolvedValue([]);

        render(<WorkspaceDemoPageClient />);

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

    it('shows an error instead of navigating when the fixture cannot be installed', async () => {
        importRegistrySpy.mockRejectedValue(new Error('Storage unavailable'));

        render(<WorkspaceDemoPageClient />);

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'app.workspace.demo.error',
        );
        expect(replaceMock).not.toHaveBeenCalled();
    });
});
