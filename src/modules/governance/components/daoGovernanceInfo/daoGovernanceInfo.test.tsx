import * as DaoService from '@/shared/api/daoService';
import * as useSlotFunction from '@/shared/hooks/useSlotFunction';
import { generateDao, generateReactQueryResultError, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { DaoGovernanceInfo, type IDaoGovernanceInfoProps } from './daoGovernanceInfo';

describe('<DaGovernanceInfo /> component', () => {
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');

    const useSlotFunctionSpy = jest.spyOn(useSlotFunction, 'useSlotFunction');

    afterEach(() => {
        useDaoSpy.mockReset();
        useSlotFunctionSpy.mockReset();
    });

    const createTestComponent = (props: IDaoGovernanceInfoProps = { daoId: 'test-id' }) => {
        const { daoId } = props;
        return (
            <OdsModulesProvider>
                <DaoGovernanceInfo daoId={daoId} />
            </OdsModulesProvider>
        );
    };
    it('renders the dao governance info component', () => {
        const dao = generateDao({ id: 'some-id', name: 'Some Dao' });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
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
        useDaoSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });
});
