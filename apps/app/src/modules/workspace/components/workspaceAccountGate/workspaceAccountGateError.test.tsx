import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as NextNavigation from 'next/navigation';
import { Network } from '@/shared/api/daoService';
import { WorkspaceAccountState } from '../../constants/workspaceAccountState';
import {
    type IWorkspaceAccountGateErrorProps,
    WorkspaceAccountGateError,
} from './workspaceAccountGateError';

describe('<WorkspaceAccountGateError /> component', () => {
    const useParamsSpy = jest.spyOn(NextNavigation, 'useParams');

    const accountId = `${Network.ETHEREUM_SEPOLIA}-0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419`;

    beforeEach(() => {
        useParamsSpy.mockReturnValue({ workspaceId: 'demo', accountId });
    });

    afterEach(() => {
        useParamsSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceAccountGateErrorProps>,
    ) => {
        const completeProps: IWorkspaceAccountGateErrorProps = { ...props };

        return (
            <GukModulesProvider>
                <WorkspaceAccountGateError {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the state of the account it is given', () => {
        render(
            createTestComponent({
                accountState: WorkspaceAccountState.NOT_FOUND,
            }),
        );

        expect(
            screen.getByText(/workspaceAccountStateCard\.notFound\.heading$/),
        ).toBeInTheDocument();
    });
});
