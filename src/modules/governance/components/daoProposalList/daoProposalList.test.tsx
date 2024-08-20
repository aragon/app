import { type IGetProposalListParams } from '@/modules/governance/api/governanceService';
import * as useDaoPluginIds from '@/shared/hooks/useDaoPluginIds';
import { render, screen } from '@testing-library/react';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { DaoProposalList, type IDaoProposalListProps } from './daoProposalList';

jest.mock('@/shared/components/pluginComponent', () => ({
    PluginComponent: (props: { slotId: string; pluginIds: string[]; initialParams?: IGetProposalListParams }) => (
        <div
            data-testid="plugin-component-mock"
            data-slotid={props.slotId}
            data-pluginids={props.pluginIds}
            data-initialparams={props.initialParams}
        />
    ),
}));

describe('<DaoProposalList /> component', () => {
    const useDaoPluginIdsSpy = jest.spyOn(useDaoPluginIds, 'useDaoPluginIds');

    afterEach(() => {
        useDaoPluginIdsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoProposalListProps>) => {
        const completeProps: IDaoProposalListProps = {
            daoId: '',
            initialParams: { queryParams: { daoId: '' } },
            ...props,
        };

        return <DaoProposalList {...completeProps} />;
    };

    it('renders a plugin component with the dao plugin ids and the correct slot id', () => {
        const pluginIds = ['id-1', 'id-2'];
        useDaoPluginIdsSpy.mockReturnValue(pluginIds);
        render(createTestComponent());
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();
        expect(pluginComponent.dataset.slotid).toEqual(GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST);
        expect(pluginComponent.dataset.pluginids).toEqual(pluginIds.join(','));
    });

    it('passes the initial params to the plugin component', () => {
        const initialParams: IGetProposalListParams = { queryParams: { daoId: 'test-id' } };
        render(createTestComponent({ initialParams }));
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent.dataset.initialparams).toEqual(initialParams.toString());
    });

    it('passes the by initial params with creator address query to the plugin component', () => {
        const initialParams = {
            queryParams: { daoId: 'test-id', creatorAddress: '0x1234567890123456789012345678901234567890' },
        };
        render(createTestComponent({ initialParams }));
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent.dataset.initialParams).toEqual(initialParams.toString());
    });
});
