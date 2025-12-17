import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { type INotFoundDaoProps, NotFoundDao } from './notFoundDao';

describe('<NotFoundDao /> component', () => {
    const createTestComponent = async (props?: Partial<INotFoundDaoProps>) => {
        const completeProps: INotFoundDaoProps = {
            params: Promise.resolve({
                addressOrEns: 'test-id',
                network: Network.ETHEREUM_MAINNET,
            }),
            ...props,
        };

        const Component = await NotFoundDao(completeProps);

        return Component;
    };

    it('renders a not-found page for DAOs', async () => {
        const params = {
            addressOrEns: 'my-dao.dao.eth',
            network: Network.ETHEREUM_MAINNET,
        };
        render(await createTestComponent({ params: Promise.resolve(params) }));

        expect(screen.getByText(/notFoundDao.title/)).toBeInTheDocument();
        expect(screen.getByText(/notFoundDao.description/)).toBeInTheDocument();
        expect(screen.getByTestId('MAGNIFYING_GLASS')).toBeInTheDocument();

        const link = screen.getByRole('link', { name: /notFoundDao.action/ });
        expect(link).toBeInTheDocument();
        expect(link.getAttribute('href')).toEqual(`/dao/${params.network}/${params.addressOrEns}/dashboard`);
    });
});
