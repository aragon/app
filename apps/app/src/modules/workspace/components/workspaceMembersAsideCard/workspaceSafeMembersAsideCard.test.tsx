import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as safeSettingsDetails from '@/modules/safe/components/safeSettingsDetails';
import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import {
    type IWorkspaceSafeMembersAsideCardProps,
    WorkspaceSafeMembersAsideCard,
} from './workspaceSafeMembersAsideCard';

describe('<WorkspaceSafeMembersAsideCard /> component', () => {
    const safeSettingsSpy = jest.spyOn(
        safeSettingsDetails,
        'SafeSettingsDetails',
    );

    const account: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-0xSafe`,
        type: WorkspaceAccountType.SAFE,
        address: '0xSafe',
        network: Network.ETHEREUM_SEPOLIA,
    };

    beforeEach(() => {
        safeSettingsSpy.mockImplementation(() => (
            <div data-testid="safe-settings-mock" />
        ));
    });

    afterEach(() => {
        safeSettingsSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceSafeMembersAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceSafeMembersAsideCardProps = {
            account,
            label: 'Grants Safe',
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceSafeMembersAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('titles the card with the label and renders the Safe settings', () => {
        render(createTestComponent());

        expect(screen.getByText('Grants Safe')).toBeInTheDocument();
        expect(screen.getByTestId('safe-settings-mock')).toBeInTheDocument();
        expect(safeSettingsSpy).toHaveBeenLastCalledWith(
            { network: account.network, address: account.address },
            undefined,
        );
    });
});
