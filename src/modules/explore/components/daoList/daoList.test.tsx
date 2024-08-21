import {
    generateDao,
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultSuccess,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { testLogger } from '@/test/utils';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import * as useDaoList from '../../api/daoExplorerService';
import { DaoList, type IDaoListProps } from './daoList';

describe('<DaoList /> component', () => {
    const useDaoListSpy = jest.spyOn(useDaoList, 'useDaoList');
    const useDaoListByMemberAddressSpy = jest.spyOn(useDaoList, 'useDaoListByMemberAddress');

    const queryClient = new QueryClient();

    afterEach(() => {
        useDaoListSpy.mockReset();
        useDaoListByMemberAddressSpy.mockReset();
        queryClient.clear();
    });

    const createTestComponent = (props?: Partial<IDaoListProps>) => {
        const completeProps: IDaoListProps = {
            initialParams: { queryParams: {} },
            ...props,
        };

        return (
            <ReactQueryWrapper>
                <DaoList {...completeProps} />
            </ReactQueryWrapper>
        );
    };

    it('renders the list of DAOs with initialParams', () => {
        const daos = [generateDao({ id: '1', name: 'DAO 1' }), generateDao({ id: '2', name: 'DAO 2' })];
        const data = daos;
        const daosResponse = generatePaginatedResponse({ data });
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
        const data = daos;
        const daosResponse = generatePaginatedResponse({
            data,
            metadata: generatePaginatedResponseMetadata(),
        });
        const initialParams = undefined;
        const daoListByMemberParams = { urlParams: { address: 'testAddress' }, queryParams: {} };

        useDaoListByMemberAddressSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({
                data: {
                    pages: [daosResponse],
                    pageParams: [],
                },
            }),
        );

        render(createTestComponent({ initialParams, daoListByMemberParams }));

        expect(screen.getAllByRole('link').length).toEqual(daos.length);
        expect(screen.getByText(daos[0].name)).toBeInTheDocument();
        expect(screen.getByText(daos[1].name)).toBeInTheDocument();
    });

    it('throws an error when initialParams and daoListByMemberParams are not provided', () => {
        testLogger.suppressErrors();
        const initialParams = undefined;
        const daoListByMemberParams = undefined;

        expect(() => render(createTestComponent({ initialParams, daoListByMemberParams }))).toThrow(
            Error('Either `initialParams` or `daoListByMemberParams` must be provided. You can not provide both.'),
        );
    });

    it('throws an error when both initialParams and daoListByMemberParams are provided', () => {
        testLogger.suppressErrors();
        const initialParams = { queryParams: { pageSize: 10 } };
        const daoListByMemberParams = { urlParams: { address: 'testAddress' }, queryParams: {} };

        expect(() => render(createTestComponent({ initialParams, daoListByMemberParams }))).toThrow(
            Error('Either `initialParams` or `daoListByMemberParams` must be provided. You can not provide both.'),
        );
    });
});
