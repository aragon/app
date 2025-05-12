import { Network } from '@/shared/api/daoService';
import { render, screen } from '@testing-library/react';
import { type INotFoundDaoProps, NotFoundDao } from './notFoundDao';

describe('<NotFoundDao /> component', () => {
    const createTestComponent = (props?: Partial<INotFoundDaoProps>) => {
        const completeProps: INotFoundDaoProps = {
            params: { addressOrEns: 'test-id', network: Network.ETHEREUM_MAINNET },
            ...props,
        };

        return <NotFoundDao {...completeProps} />;
    };

    it('renders a not-found page for DAOs', () => {
        const params = { addressOrEns: 'my-dao.dao.eth', network: Network.ETHEREUM_MAINNET };
        render(createTestComponent({ params }));

        expect(screen.getByText(/notFoundDao.title/)).toBeInTheDocument();
        expect(screen.getByText(/notFoundDao.description/)).toBeInTheDocument();
        expect(screen.getByTestId('MAGNIFYING_GLASS')).toBeInTheDocument();

        const link = screen.getByRole('link', { name: /notFoundDao.action/ });
        expect(link).toBeInTheDocument();
        expect(link.getAttribute('href')).toEqual(`/dao/${params.network}/${params.addressOrEns}/dashboard`);
    });
});
