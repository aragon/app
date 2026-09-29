import { render, screen } from '@testing-library/react';
import * as NextNavigation from 'next/navigation';
import {
    useWorkspaceBaseUrl,
    WorkspaceBaseUrlProvider,
} from './workspaceBaseUrlProvider';

describe('<WorkspaceBaseUrlProvider /> component', () => {
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');

    afterEach(() => {
        usePathnameSpy.mockReset();
    });

    const ContextConsumer: React.FC = () => {
        const baseUrl = useWorkspaceBaseUrl();

        return <p data-testid="base-url">{baseUrl ?? 'none'}</p>;
    };

    const createTestComponent = () => (
        <WorkspaceBaseUrlProvider>
            <ContextConsumer />
        </WorkspaceBaseUrlProvider>
    );

    it.each([
        { pathname: '/workspace/demo', expected: '/workspace/demo' },
        { pathname: '/workspace/demo/proposals', expected: '/workspace/demo' },
        {
            pathname: '/workspace/demo/proposals/ethereum-sepolia-0x123/SLUG-1',
            expected: '/workspace/demo',
        },
    ])('builds the workspace URL of $pathname', ({ pathname, expected }) => {
        usePathnameSpy.mockReturnValue(pathname);
        render(createTestComponent());

        expect(screen.getByTestId('base-url')).toHaveTextContent(expected);
    });

    it.each([
        {
            case: 'a DAO page',
            pathname: '/dao/ethereum-mainnet/0x123/proposals',
        },
        { case: 'the explore page', pathname: '/' },
        { case: 'the workspace list', pathname: '/workspace' },
        { case: 'a workspace creation page', pathname: '/create/workspace' },
    ])('builds no URL on $case', ({ pathname }) => {
        usePathnameSpy.mockReturnValue(pathname);
        render(createTestComponent());

        expect(screen.getByTestId('base-url')).toHaveTextContent('none');
    });

    it('builds no URL when there is no path', () => {
        usePathnameSpy.mockReturnValue(null as unknown as string);
        render(createTestComponent());

        expect(screen.getByTestId('base-url')).toHaveTextContent('none');
    });
});
