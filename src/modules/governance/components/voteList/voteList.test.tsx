import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import type { IPluginFilterComponentProps } from '@/shared/components/pluginFilterComponent';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import {
    generateDaoPlugin,
    generateFilterComponentPlugin,
} from '@/shared/testUtils';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { type IVoteListProps, VoteList } from './voteList';

jest.mock('@/shared/components/pluginFilterComponent', () => ({
    PluginFilterComponent: (props: {
        slotId: string;
        plugins: IPluginFilterComponentProps[];
    }) => (
        <div
            data-plugins={props.plugins[0].id}
            data-slotid={props.slotId}
            data-testid="plugin-component-mock"
        />
    ),
}));

describe('<VoteList /> component', () => {
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    afterEach(() => {
        useDaoPluginsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IVoteListProps>) => {
        const completeProps: IVoteListProps = {
            initialParams: {
                queryParams: { network: Network.ETHEREUM_SEPOLIA },
            },
            daoId: 'dao-id',
            ...props,
        };

        return <VoteList {...completeProps} />;
    };

    it('renders a plugin tab component with the process plugins and the dao-vote-list slot id', () => {
        const daoPlugin = generateDaoPlugin({ address: '0x1239478' });
        const plugins = [
            generateFilterComponentPlugin({ id: 'token', meta: daoPlugin }),
        ];
        useDaoPluginsSpy.mockReturnValue(plugins);

        render(createTestComponent());

        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();

        expect(pluginComponent.dataset.slotid).toEqual(
            GovernanceSlotId.GOVERNANCE_VOTE_LIST,
        );
        expect(pluginComponent.dataset.plugins).toEqual(plugins[0].id);
    });
});
