import * as useDaoPluginIds from '@/shared/hooks/useDaoPluginIds';
import * as useSlotFunction from '@/shared/hooks/useSlotFunction';
import { generateDaoPlugin } from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { DaoGovernanceInfo, type IDaoGovernanceInfoProps } from './daoGovernanceInfo';

describe('<DaGovernanceInfo /> component', () => {
    const useDaoPluginIdsSpy = jest.spyOn(useDaoPluginIds, 'useDaoPluginIds');
    const useSlotFunctionSpy = jest.spyOn(useSlotFunction, 'useSlotFunction');

    afterEach(() => {
        useDaoPluginIdsSpy.mockReset();
        useSlotFunctionSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoGovernanceInfoProps>) => {
        const completeProps = {
            daoId: 'test-id',
            plugin: generateDaoPlugin(),
            ...props,
        };
        return (
            <OdsModulesProvider>
                <DaoGovernanceInfo {...completeProps} />
            </OdsModulesProvider>
        );
    };
    it('renders the DAO governance settings', () => {
        const pluginIds = ['multisig'];
        useDaoPluginIdsSpy.mockReturnValue(pluginIds);
        useSlotFunctionSpy.mockReturnValue([
            { term: 'Governance Term 1', definition: 'Definition 1' },
            { term: 'Governance Term 2', definition: 'Definition 2' },
        ]);
        render(createTestComponent());

        expect(screen.getByText('Governance Term 1')).toBeInTheDocument();
        expect(screen.getByText('Definition 1')).toBeInTheDocument();
        expect(screen.getByText('Governance Term 2')).toBeInTheDocument();
        expect(screen.getByText('Definition 2')).toBeInTheDocument();
    });

    it('returns empty container on dao fetch error', () => {
        useSlotFunctionSpy.mockReturnValue(null);
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });
});
