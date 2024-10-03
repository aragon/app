import type { ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import { generateDaoPlugin, generateTabComponentPlugin } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { DaoProposalList, type IDaoProposalListProps } from './daoProposalList';

jest.mock('@/shared/components/pluginTabComponent', () => ({
    PluginTabComponent: (props: { slotId: string; plugins: ITabComponentPlugin[] }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-plugins={props.plugins[0].id} />
    ),
}));

describe('<DaoProposalList /> component', () => {
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    afterEach(() => {
        useDaoPluginsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoProposalListProps>) => {
        const completeProps: IDaoProposalListProps = {
            initialParams: { queryParams: { daoId: 'dao-id', pluginAddress: '0x123' } },
            ...props,
        };

        return <DaoProposalList {...completeProps} />;
    };

    it('renders a plugin tab component with the process plugins and the correct slot id', () => {
        const plugins = [generateTabComponentPlugin({ id: 'token', meta: generateDaoPlugin() })];
        useDaoPluginsSpy.mockReturnValue(plugins);
        render(createTestComponent());
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();
        expect(pluginComponent.dataset.slotid).toEqual(GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST);
        expect(pluginComponent.dataset.plugins).toEqual(plugins[0].id);
    });
});
