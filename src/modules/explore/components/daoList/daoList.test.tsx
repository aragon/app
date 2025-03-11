import {
    generateDao,
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultSuccess,
} from '@/shared/testUtils';
import { testLogger } from '@/test/utils';
import { render, screen } from '@testing-library/react';
import * as daoExplorerService from '../../api/daoExplorerService';
import { DaoList, type IDaoListProps } from './daoList';

describe('<DaoList /> component', () => {
    const useDaoListSpy = jest.spyOn(daoExplorerService, 'useDaoList');
    const useDaoListByMemberAddressSpy = jest.spyOn(daoExplorerService, 'useDaoListByMemberAddress');

    beforeEach(() => {
        useDaoListSpy.mockReturnValue(generateReactQueryInfiniteResultSuccess({ data: { pages: [], pageParams: [] } }));
        useDaoListByMemberAddressSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [], pageParams: [] } }),
        );
    });

    afterEach(() => {
        useDaoListSpy.mockReset();
        useDaoListByMemberAddressSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoListProps>) => {
        const completeProps: IDaoListProps = {
            initialParams: { queryParams: {} },
            ...props,
        };

        return <DaoList {...completeProps} />;
    };

    it('renders the list of DAOs with initialParams', () => {
        const daos = [generateDao({ id: '1', name: 'DAO 1' }), generateDao({ id: '2', name: 'DAO 2' })];
        const daosResponse = generatePaginatedResponse({ data: daos });
        const initialParams = { queryParams: { pageSize: 20 } };
        const daoListByMemberParams = undefined;

        useDaoListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [daosResponse], pageParams: [] } }),
        );

        render(createTestComponent({ initialParams, daoListByMemberParams }));

        expect(screen.getAllByRole('link').length).toEqual(daos.length);
        expect(screen.getByText(daos[0].name)).toBeInTheDocument();
        expect(screen.getByText(daos[1].name)).toBeInTheDocument();
    });

    it('renders the list of DAOs by member address when daoListByMemberParams is provided', () => {
        const daos = [generateDao({ id: '1', name: 'DAO 1' }), generateDao({ id: '2', name: 'DAO 2' })];
        const daosResponse = generatePaginatedResponse({
            data: daos,
            metadata: generatePaginatedResponseMetadata(),
        });
        const initialParams = undefined;
        const daoListByMemberParams = { urlParams: { address: 'testAddress' }, queryParams: {} };

        useDaoListByMemberAddressSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [daosResponse], pageParams: [] } }),
        );

        render(createTestComponent({ initialParams, daoListByMemberParams }));

        expect(screen.getAllByRole('link').length).toEqual(daos.length);
        expect(screen.getByText(daos[0].name)).toBeInTheDocument();
        expect(screen.getByText(daos[1].name)).toBeInTheDocument();
    });

    it('renders the list of DAOs with search input when showSearch flag is set', () => {
        useDaoListSpy.mockReturnValue(generateReactQueryInfiniteResultSuccess({ data: { pages: [], pageParams: [] } }));
        render(createTestComponent({ showSearch: true }));
        expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('renders the list of DAOs without search input when showSearch flag is not set', () => {
        useDaoListSpy.mockReturnValue(generateReactQueryInfiniteResultSuccess({ data: { pages: [], pageParams: [] } }));
        render(createTestComponent({ showSearch: false }));
        expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    });

    it('throws an error when both initialParams and daoListByMemberParams are not provided', () => {
        testLogger.suppressErrors();
        const initialParams = undefined;
        const daoListByMemberParams = undefined;
        expect(() => render(createTestComponent({ initialParams, daoListByMemberParams }))).toThrow();
    });

    it('throws an error when both initialParams and daoListByMemberParams are provided', () => {
        testLogger.suppressErrors();
        const initialParams = { queryParams: { pageSize: 10 } };
        const daoListByMemberParams = { urlParams: { address: 'testAddress' }, queryParams: {} };
        expect(() => render(createTestComponent({ initialParams, daoListByMemberParams }))).toThrow();
    });
});
