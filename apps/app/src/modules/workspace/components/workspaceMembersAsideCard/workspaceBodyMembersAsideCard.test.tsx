import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as daoPluginInfo from '@/modules/settings/components/daoPluginInfo';
import { SettingsSlotId } from '@/modules/settings/constants/moduleSlots';
import { Network } from '@/shared/api/daoService';
import * as pluginSingleComponent from '@/shared/components/pluginSingleComponent';
import { generateDaoPlugin } from '@/shared/testUtils';
import { PluginType } from '@/shared/types';
import type { IWorkspaceBodyMemberTab } from '../../hooks/useWorkspaceMemberTabs';
import {
    type IWorkspaceBodyMembersAsideCardProps,
    WorkspaceBodyMembersAsideCard,
} from './workspaceBodyMembersAsideCard';

describe('<WorkspaceBodyMembersAsideCard /> component', () => {
    const daoPluginInfoSpy = jest.spyOn(daoPluginInfo, 'DaoPluginInfo');
    const pluginSingleComponentSpy = jest.spyOn(
        pluginSingleComponent,
        'PluginSingleComponent',
    );

    const accountId = `${Network.ETHEREUM_SEPOLIA}-0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5`;
    const plugin = generateDaoPlugin({ address: '0xMultisig', slug: 'mul' });

    const buildTab = (tab?: Partial<IWorkspaceBodyMemberTab>) =>
        ({
            kind: 'body',
            accountId,
            id: 'multisig',
            uniqueId: `${Network.ETHEREUM_SEPOLIA}-0xMultisig-mul`,
            label: 'Demo DAO · Multisig',
            meta: plugin,
            props: {},
            ...tab,
        }) as IWorkspaceBodyMemberTab;

    beforeEach(() => {
        pluginSingleComponentSpy.mockImplementation(() => (
            <div data-testid="plugin-slot-mock" />
        ));
        daoPluginInfoSpy.mockImplementation(() => (
            <div data-testid="plugin-info-mock" />
        ));
    });

    afterEach(() => {
        pluginSingleComponentSpy.mockReset();
        daoPluginInfoSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceBodyMembersAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceBodyMembersAsideCardProps = {
            tab: buildTab(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceBodyMembersAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    // An account ID is already the DAO ID, so the slot component reads the DAO pages' own query.
    it('renders the plugin-info slot of the body with the generic info as fallback', () => {
        render(createTestComponent());

        expect(screen.getByTestId('plugin-slot-mock')).toBeInTheDocument();
        expect(pluginSingleComponentSpy).toHaveBeenLastCalledWith(
            {
                slotId: SettingsSlotId.SETTINGS_PLUGIN_INFO,
                pluginId: 'multisig',
                plugin,
                daoId: accountId,
                type: PluginType.BODY,
                Fallback: daoPluginInfo.DaoPluginInfo,
            },
            undefined,
        );
    });

    // The DAO members page titles the card with the body alone, the slug being part of the process card instead.
    it('titles the card with the tab label', () => {
        render(createTestComponent());

        expect(screen.getByText('Demo DAO · Multisig')).toBeInTheDocument();
    });
});
