import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { generateDao, generatePaginatedResponse, generateReactQueryInfiniteResultSuccess } from '@/shared/testUtils';
import { testLogger } from '@/test/utils';
import * as daoExplorerService from '../../api/daoExplorerService';
import { DaoList, type IDaoListProps } from './daoList';

describe('<DaoList /> component', () => {
    const useDaoListSpy = jest.spyOn(daoExplorerService, 'useDaoList');
    const useDaoListByMemberAddressSpy = jest.spyOn(daoExplorerService, 'useDaoListByMemberAddress');

    beforeEach(() => {
        useDaoListSpy.mockReturnValue(generateReactQueryInfiniteResultSuccess({ data: { pages: [], pageParams: [] } }));
        useDaoListByMemberAddressSpy.mockReturnValue(generateReactQueryInfiniteResultSuccess({ data: { pages: [], pageParams: [] } }));
    });

    afterEach(() => {
        useDaoListSpy.mockReset();
        useDaoListByMemberAddressSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoListProps>) => {
        const completeProps: IDaoListProps = {
            initialParams: { queryParams: { networks: [Network.ETHEREUM_MAINNET] } },
            ...props,
        };

        return <DaoList {...completeProps} />;
    };

    it('renders a list of DAOs using the parameters set on the initialParams prop', () => {
        const daos = [generateDao({ id: '1', name: 'DAO 1' }), generateDao({ id: '2', name: 'DAO 2' })];
        const queryResult = generateReactQueryInfiniteResultSuccess({
            data: { pages: [generatePaginatedResponse({ data: daos })], pageParams: [] },
        });
        const initialParams = { queryParams: { networks: [Network.ETHEREUM_MAINNET], pageSize: 20 } };

        useDaoListSpy.mockReturnValue(queryResult);
        render(createTestComponent({ initialParams, memberParams: undefined }));

        expect(useDaoListSpy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ enabled: true }));
        expect(useDaoListByMemberAddressSpy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ enabled: false }));
        expect(screen.getAllByRole('link')).toHaveLength(daos.length);
        expect(screen.getByText(daos[0].name)).toBeInTheDocument();
        expect(screen.getByText(daos[1].name)).toBeInTheDocument();
    });

    it('renders a list of DAOs by member address using the parameters set on the memberParams prop', () => {
        const daos = [generateDao({ id: '1', name: 'DAO 1' }), generateDao({ id: '2', name: 'DAO 2' })];
        const queryResult = generateReactQueryInfiniteResultSuccess({
            data: { pages: [generatePaginatedResponse({ data: daos })], pageParams: [] },
        });
        const initialParams = { queryParams: { networks: [Network.ETHEREUM_MAINNET], pageSize: 20 } };
        const memberParams = { urlParams: { address: 'testAddress' }, queryParams: {} };

        useDaoListByMemberAddressSpy.mockReturnValue(queryResult);
        render(createTestComponent({ initialParams, memberParams }));

        expect(useDaoListSpy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ enabled: false }));
        expect(useDaoListByMemberAddressSpy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ enabled: true }));
        expect(screen.getAllByRole('link')).toHaveLength(daos.length);
        expect(screen.getByText(daos[0].name)).toBeInTheDocument();
        expect(screen.getByText(daos[1].name)).toBeInTheDocument();
    });

    it('renders a search input when the showSearch prop is set', () => {
        useDaoListSpy.mockReturnValue(generateReactQueryInfiniteResultSuccess({ data: { pages: [], pageParams: [] } }));
        render(createTestComponent({ showSearch: true }));
        expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('does not render a search input when the showSearch prop is not set', () => {
        useDaoListSpy.mockReturnValue(generateReactQueryInfiniteResultSuccess({ data: { pages: [], pageParams: [] } }));
        render(createTestComponent({ showSearch: false }));
        expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    });

    it('throws error when both initialParams and memberParams are not provided', () => {
        testLogger.suppressErrors();
        const initialParams = undefined;
        const memberParams = undefined;
        expect(() => render(createTestComponent({ initialParams, memberParams }))).toThrow();
    });
});
