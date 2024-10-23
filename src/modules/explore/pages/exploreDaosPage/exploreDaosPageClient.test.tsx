import * as useDialogContext from '@/shared/components/dialogProvider';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as Wagmi from 'wagmi';
import { ExploreDaosPageClient, type IExploreDaosPageClientProps } from './exploreDaosPageClient';

jest.mock('../../components/daoList', () => ({ DaoList: () => <div data-testid="dao-list-mock" /> }));

describe('<ExploreDaosPageClient /> component', () => {
    const useAccountSpy = jest.spyOn(Wagmi, 'useAccount');
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');

    beforeEach(() => {
        useAccountSpy.mockReturnValue({} as Wagmi.UseAccountReturnType);
        useDialogContextSpy.mockReturnValue({ open: jest.fn(), close: jest.fn() });
    });

    afterEach(() => {
        useAccountSpy.mockReset();
        useDialogContextSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IExploreDaosPageClientProps>) => {
        const completeProps: IExploreDaosPageClientProps = {
            initialParams: { queryParams: {} },
            ...props,
        };

        return (
            <GukModulesProvider>
                <ExploreDaosPageClient {...completeProps} />;
            </GukModulesProvider>
        );
    };

    it('renders the list of DAOs', () => {
        render(createTestComponent());
        expect(screen.getByTestId('dao-list-mock')).toBeInTheDocument();
    });
});
