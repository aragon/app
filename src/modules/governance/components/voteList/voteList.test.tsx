import * as useDaoPluginIds from '@/shared/hooks/useDaoPluginIds';
import { render, screen } from '@testing-library/react';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { VoteList, type IVoteListProps } from './voteList';

jest.mock('@/shared/components/pluginComponent', () => ({
    PluginComponent: (props: { slotId: string; pluginIds: string[] }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-pluginids={props.pluginIds} />
    ),
}));

describe('<VoteList /> component', () => {
    const useDaoPluginIdsSpy = jest.spyOn(useDaoPluginIds, 'useDaoPluginIds');

    afterEach(() => {
        useDaoPluginIdsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IVoteListProps>) => {
        const completeProps: IVoteListProps = {
            params: { queryParams: {} },
            daoId: 'dao',
            ...props,
        };

        return <VoteList {...completeProps} />;
    };

    it('renders a plugin component with the dao plugins ids and the vote-list slot it', () => {
        const pluginIds = ['id-1', 'id-2', 'id-3'];
        useDaoPluginIdsSpy.mockReturnValue(pluginIds);
        render(createTestComponent());
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();
        expect(pluginComponent.dataset.slotid).toEqual(GovernanceSlotId.GOVERNANCE_VOTE_LIST);
        expect(pluginComponent.dataset.pluginids).toEqual(pluginIds.toString());
    });
});
