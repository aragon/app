import { render, screen } from '@testing-library/react';
import { CreateProposalFormSettings, type ICreateProposalFormSettingsProps } from './createProposalFormSettings';
import * as useDaoPluginIds from '@/shared/hooks/useDaoPluginIds';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';

jest.mock('@/shared/components/pluginComponent', () => ({
    PluginComponent: (props: { slotId: string; pluginIds: string[] }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-pluginids={props.pluginIds} />
    ),
}));

describe('<CreateProposalFormSettings /> component', () => {
       const useDaoPluginIdsSpy = jest.spyOn(useDaoPluginIds, 'useDaoPluginIds');

    afterEach(() => {
        useDaoPluginIdsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ICreateProposalFormSettingsProps>) => {
        const completeProps: ICreateProposalFormSettingsProps = { daoId: 'test', ...props };

        return <CreateProposalFormSettings {...completeProps} />;
    };

    it('renders a plugin component with the dao plugins ids and the dao-create-proposal-settings-form slot', () => {
        const pluginIds = ['id-1', 'id-2'];
        useDaoPluginIdsSpy.mockReturnValue(pluginIds);
        render(createTestComponent());
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();
        expect(pluginComponent.dataset.slotid).toEqual(GovernanceSlotId.GOVERNANCE_CREATE_PROPOSAL_SETTINGS_FORM);
        expect(pluginComponent.dataset.pluginids).toEqual(pluginIds.toString());
    });
});
