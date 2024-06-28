import { Network } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { generateDao } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { FinanceDetailsList, type IFinanceDetailsListProps } from './financeDetailsList';

describe('<FinanceDetailsList /> component', () => {
    const createTestComponent = (props: Partial<IFinanceDetailsListProps>) => {
        const completeProps: IFinanceDetailsListProps = {
            dao: generateDao(),
            ...props,
        };

        return (
            <Page.Main>
                <FinanceDetailsList {...completeProps} />
            </Page.Main>
        );
    };

    it('renders the finance details list based on the provided dao', () => {
        const dao = generateDao({
            network: Network.POLYGON_MAINNET,
            address: '0x1b765393c3E2f3d25c44eb9Cf6B864B3fD250cDB',
            ens: 'dao.polygon',
        });

        render(createTestComponent({ dao }));
        expect(screen.getByText(networkDefinitions[dao.network].name)).toBeInTheDocument();
        expect(screen.getByText('0x1b…0cDB')).toBeInTheDocument();
        expect(screen.getByText('dao.polygon')).toBeInTheDocument();
    });

    it('does not render the DAO ens when missing', () => {
        const dao = generateDao({ ens: undefined });
        render(createTestComponent({ dao }));
        expect(screen.queryByText('dao.polygon')).not.toBeInTheDocument();
    });
});
