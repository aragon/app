import { render, screen } from '@testing-library/react';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import { generateDaoPlugin, generateFilterComponentPlugin } from '@/shared/testUtils';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { DaoProposalList, type IDaoProposalListProps } from './daoProposalList';

jest.mock('@/shared/components/pluginFilterComponent', () => ({
    PluginFilterComponent: (props: { slotId: string; plugins: IFilterComponentPlugin[] }) => (
        <div data-plugins={props.plugins[0].id} data-slotid={props.slotId} data-testid="plugin-component-mock" />
    ),
}));

describe('<DaoProposalList /> component', () => {
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    afterEach(() => {
        useDaoPluginsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoProposalListProps>) => {
        const completeProps: IDaoProposalListProps = {
            initialParams: { queryParams: { daoId: 'dao-id' } },
            ...props,
        };

        return <DaoProposalList {...completeProps} />;
    };

    it('renders a plugin tab component with the process plugins and the correct slot id', () => {
        const plugins = [
            generateFilterComponentPlugin({
                id: 'token',
                meta: generateDaoPlugin(),
            }),
        ];
        useDaoPluginsSpy.mockReturnValue(plugins);
        render(createTestComponent());
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();
        expect(pluginComponent.dataset.slotid).toEqual(GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST);
        expect(pluginComponent.dataset.plugins).toEqual(plugins[0].id);
    });
});
