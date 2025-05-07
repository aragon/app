import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { DaoSettingsPage, type IDaoSettingsPageProps } from './daoSettingsPage';
import { DaoSettingsPageClient } from './daoSettingsPageClient';

jest.mock('./daoSettingsPageClient', () => ({
    DaoSettingsPageClient: jest.fn(() => <div data-testid="page-client-mock" />),
}));

describe('<DaoSettingsPage /> component', () => {
    const createTestComponent = async (props?: Partial<IDaoSettingsPageProps>) => {
        const completeProps: IDaoSettingsPageProps = {
            params: Promise.resolve({ id: 'dao-id', network: 'network' }),
            ...props,
        };
        const Component = await DaoSettingsPage(completeProps);

        return <GukModulesProvider>{Component}</GukModulesProvider>;
    };

    it('renders and passes the correct daoId to DaoSettingsPageClient', async () => {
        const params = { id: 'my-dao', network: 'network' };
        render(await createTestComponent({ params: Promise.resolve(params) }));

        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
        expect(DaoSettingsPageClient).toHaveBeenCalledWith(expect.objectContaining({ daoId: params.id }), undefined);
    });
});
