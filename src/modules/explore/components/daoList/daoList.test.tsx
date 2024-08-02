import { generateDao, generatePaginatedResponse, generateReactQueryInfiniteResultSuccess } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import * as useDaoList from '../../api/daoExplorerService';
import { DaoList, type IDaoListProps } from './daoList';

describe('<DaoList /> component', () => {
    const useDaoListSpy = jest.spyOn(useDaoList, 'useDaoList');

    afterEach(() => {
        useDaoListSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoListProps>) => {
        const completeProps: IDaoListProps = {
            initialParams: { queryParams: {} },
            ...props,
        };

        return <DaoList {...completeProps} />;
    };

    it('renders the list of DAOs', () => {
        const daos = [generateDao({ id: '1', name: 'DAO 1' }), generateDao({ id: '2', name: 'DAO 2' })];
        const daosResponse = generatePaginatedResponse({ data: daos });
        useDaoListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [daosResponse], pageParams: [] } }),
        );
        render(createTestComponent());
        expect(screen.getAllByRole('link').length).toEqual(daos.length);
        expect(screen.getByText(daos[0].name)).toBeInTheDocument();
        expect(screen.getByText(daos[1].name)).toBeInTheDocument();
    });
});
