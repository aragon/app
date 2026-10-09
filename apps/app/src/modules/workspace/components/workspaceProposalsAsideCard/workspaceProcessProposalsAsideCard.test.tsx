import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as daoPluginInfo from '@/modules/settings/components/daoPluginInfo';
import { Network } from '@/shared/api/daoService';
import { generateDaoPlugin } from '@/shared/testUtils';
import { PluginType } from '@/shared/types';
import type { IWorkspaceProposalTab } from '../../hooks/useWorkspaceProposalTabs';
import {
    type IWorkspaceProcessProposalsAsideCardProps,
    WorkspaceProcessProposalsAsideCard,
} from './workspaceProcessProposalsAsideCard';

describe('<WorkspaceProcessProposalsAsideCard /> component', () => {
    const daoPluginInfoSpy = jest.spyOn(daoPluginInfo, 'DaoPluginInfo');

    const accountId = `${Network.ETHEREUM_SEPOLIA}-0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5`;
    const plugin = generateDaoPlugin({ address: '0xMultisig', slug: 'mul' });

    const buildTab = (tab?: Partial<IWorkspaceProposalTab>) =>
        ({
            accountId,
            id: 'multisig',
            uniqueId: `${Network.ETHEREUM_SEPOLIA}-0xMultisig-mul`,
            label: 'Demo DAO · Multisig',
            meta: plugin,
            props: {},
            ...tab,
        }) as IWorkspaceProposalTab;

    beforeEach(() => {
        daoPluginInfoSpy.mockImplementation(() => (
            <div data-testid="plugin-info-mock" />
        ));
    });

    afterEach(() => {
        daoPluginInfoSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceProcessProposalsAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceProcessProposalsAsideCardProps = {
            tab: buildTab(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceProcessProposalsAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    // An account ID is already the DAO ID, so the component reads the DAO pages' own query.
    it('describes the process of the tab under the account it is installed on', () => {
        render(createTestComponent());

        expect(screen.getByTestId('plugin-info-mock')).toBeInTheDocument();
        expect(daoPluginInfoSpy).toHaveBeenLastCalledWith(
            { daoId: accountId, plugin, type: PluginType.PROCESS },
            undefined,
        );
    });

    // Matches the DAO proposals page, which titles the card with the process and its slug.
    it('titles the card with the tab label and the uppercased slug', () => {
        render(createTestComponent());

        expect(
            screen.getByText('Demo DAO · Multisig (MUL)'),
        ).toBeInTheDocument();
    });
});
