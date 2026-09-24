import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as daoFilterAsideCard from '@/modules/finance/components/daoFilterAsideCard';
import * as daoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import {
    generateDao,
    generatePaginatedResponseMetadata,
    generateReactQueryResultLoading,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import {
    type IWorkspaceDaoAssetsAsideCardProps,
    WorkspaceDaoAssetsAsideCard,
} from './workspaceDaoAssetsAsideCard';

describe('<WorkspaceDaoAssetsAsideCard /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const daoFilterAsideCardSpy = jest.spyOn(
        daoFilterAsideCard,
        'DaoFilterAsideCard',
    );

    const daoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${daoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: daoAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const dao = generateDao({ id: daoAccount.id, address: daoAddress });

    beforeEach(() => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }) as ReturnType<
                typeof daoService.useDao
            >,
        );
        daoFilterAsideCardSpy.mockImplementation(() => (
            <div data-testid="dao-filter-aside-mock" />
        ));
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        daoFilterAsideCardSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceDaoAssetsAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceDaoAssetsAsideCardProps = {
            account: daoAccount,
            label: 'Demo DAO',
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceDaoAssetsAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('reads the DAO of the account and renders its assets card as the parent-DAO view', () => {
        const metadata = generatePaginatedResponseMetadata({
            totalRecords: 7,
        });
        render(createTestComponent({ metadata }));

        expect(useDaoSpy).toHaveBeenLastCalledWith({
            urlParams: { id: daoAccount.id },
        });
        expect(screen.getByTestId('dao-filter-aside-mock')).toBeInTheDocument();
        expect(daoFilterAsideCardSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                dao,
                statsType: 'assets',
                activeOption: {
                    id: dao.id,
                    label: 'Demo DAO',
                    daoId: dao.id,
                    isAll: false,
                    isParent: true,
                },
                selectedMetadata: { metadata, data: [] },
            }),
            undefined,
        );
    });

    it('renders nothing while the DAO is being read', () => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof daoService.useDao
            >,
        );
        const { container } = render(createTestComponent());

        expect(container).toBeEmptyDOMElement();
    });
});
