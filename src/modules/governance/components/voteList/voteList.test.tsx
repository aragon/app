import type { IGetVoteListParams } from '@/modules/governance/api/governanceService';
import * as useDaoPluginIds from '@/shared/hooks/useDaoPluginIds';
import { render, screen } from '@testing-library/react';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { VoteList, type IVoteListProps } from './voteList';

jest.mock('@/shared/components/pluginComponent', () => ({
    PluginComponent: (props: { slotId: string; pluginIds: string[]; params: IGetVoteListParams; daoId: string }) => (
        <div
            data-testid="plugin-component-mock"
            data-slotid={props.slotId}
            data-pluginids={props.pluginIds}
            data-params={props.params}
            data-daoid={props.daoId}
        />
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
            daoId: 'dao-id',
            ...props,
        };

        return <VoteList {...completeProps} />;
    };

    it('renders a plugin component with the dao plugin ids and the vote-list slot id', () => {
        const pluginIds = ['id-1', 'id-2', 'id-3'];
        useDaoPluginIdsSpy.mockReturnValue(pluginIds);

        render(createTestComponent());
        const pluginComponent = screen.getByTestId('plugin-component-mock');

        expect(pluginComponent).toBeInTheDocument();
        expect(pluginComponent.dataset.slotid).toEqual(GovernanceSlotId.GOVERNANCE_VOTE_LIST);
        expect(pluginComponent.dataset.pluginids).toEqual(pluginIds.toString());
    });

    it('passes the params and daoId props to the PluginComponent', () => {
        const pluginIds = ['id-1', 'id-2', 'id-3'];
        const params = { queryParams: { daoId: 'dao-id-test' } };
        const daoId = 'dao-123';

        useDaoPluginIdsSpy.mockReturnValue(pluginIds);

        render(createTestComponent({ params, daoId }));
        const pluginComponent = screen.getByTestId('plugin-component-mock');

        expect(pluginComponent.dataset.params).toEqual(params.toString());
        expect(pluginComponent.dataset.daoid).toEqual(daoId);
    });
});
