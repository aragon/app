import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as NextNavigation from 'next/navigation';
import { Network } from '@/shared/api/daoService';
import { WorkspaceAccountState } from '../../constants/workspaceAccountState';
import {
    type IWorkspaceAccountStateCardProps,
    WorkspaceAccountStateCard,
} from './workspaceAccountStateCard';

describe('<WorkspaceAccountStateCard /> component', () => {
    const useParamsSpy = jest.spyOn(NextNavigation, 'useParams');
    const retryMock = jest.fn();

    const accountId = `${Network.ETHEREUM_SEPOLIA}-0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419`;

    beforeEach(() => {
        useParamsSpy.mockReturnValue({ workspaceId: 'demo', accountId });
    });

    afterEach(() => {
        useParamsSpy.mockReset();
        retryMock.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceAccountStateCardProps>,
    ) => {
        const completeProps: IWorkspaceAccountStateCardProps = {
            onRetry: retryMock,
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceAccountStateCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    it.each([
        { scenario: 'no account state', accountState: undefined },
        { scenario: 'a DAO', accountState: WorkspaceAccountState.DAO },
    ])('renders the generic error for $scenario', ({ accountState }) => {
        render(createTestComponent({ accountState }));

        expect(
            screen.getByText(/workspaceAccountStateCard\.error\.heading$/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceAccountStateCard\.error\.description$/),
        ).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('points a Safe to the sections that serve it', () => {
        render(
            createTestComponent({ accountState: WorkspaceAccountState.SAFE }),
        );

        expect(
            screen.getByText(/workspaceAccountStateCard\.safe\.heading$/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /safe\.action\.assets$/ }),
        ).toHaveAttribute('href', `/workspace/demo/${accountId}/assets`);
        expect(
            screen.getByRole('link', { name: /safe\.action\.transactions$/ }),
        ).toHaveAttribute('href', `/workspace/demo/${accountId}/transactions`);
    });

    it('renders the not-found state with a way back to every account', () => {
        render(
            createTestComponent({
                accountState: WorkspaceAccountState.NOT_FOUND,
            }),
        );

        expect(
            screen.getByText(/workspaceAccountStateCard\.notFound\.heading$/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /notFound\.action$/ }),
        ).toHaveAttribute('href', '/workspace/demo/all/overview');
    });

    it('offers a retry when the account could not be verified', async () => {
        render(
            createTestComponent({
                accountState: WorkspaceAccountState.UNAVAILABLE,
            }),
        );

        expect(
            screen.getByText(
                /workspaceAccountStateCard\.unavailable\.heading$/,
            ),
        ).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole('button', { name: /unavailable\.action$/ }),
        );

        expect(retryMock).toHaveBeenCalled();
    });
});
