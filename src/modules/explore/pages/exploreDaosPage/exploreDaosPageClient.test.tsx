import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as Wagmi from 'wagmi';
import { Network } from '@/shared/api/daoService';
import * as useDialogContext from '@/shared/components/dialogProvider';
import { generateDialogContext, generateReactQueryInfiniteResultSuccess } from '@/shared/testUtils';
import * as CmsService from '../../api/cmsService';
import { ExploreDaosPageClient, type IExploreDaosPageClientProps } from './exploreDaosPageClient';

jest.mock('../../components/daoList', () => ({
    DaoList: () => <div data-testid="dao-list-mock" />,
}));

describe('<ExploreDaosPageClient /> component', () => {
    const useAccountSpy = jest.spyOn(Wagmi, 'useAccount');
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');
    const useFeaturedDaosSpy = jest.spyOn(CmsService, 'useFeaturedDaos');

    beforeEach(() => {
        useAccountSpy.mockReturnValue({} as Wagmi.UseAccountReturnType);
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useFeaturedDaosSpy.mockReturnValue(generateReactQueryInfiniteResultSuccess({ data: [] }));
    });

    afterEach(() => {
        useAccountSpy.mockReset();
        useDialogContextSpy.mockReset();
        useFeaturedDaosSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IExploreDaosPageClientProps>) => {
        const completeProps: IExploreDaosPageClientProps = {
            initialParams: {
                queryParams: { networks: [Network.ETHEREUM_MAINNET] },
            },
            ...props,
        };

        return (
            <GukModulesProvider>
                <ExploreDaosPageClient {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the list of DAOs', () => {
        render(createTestComponent());
        expect(screen.getByTestId('dao-list-mock')).toBeInTheDocument();
    });
});
