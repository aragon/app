import { Network } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { generateDao } from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { FinanceDetailsList, type IFinanceDetailsListProps } from './financeDetailsList';

describe('<FinanceDetailsList /> component', () => {
    const createTestComponent = (props: Partial<IFinanceDetailsListProps>) => {
        const completeProps: IFinanceDetailsListProps = {
            dao: generateDao(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <Page.Main>
                    <FinanceDetailsList {...completeProps} />
                </Page.Main>
            </GukModulesProvider>
        );
    };

    it('renders the finance details list based on the provided dao', () => {
        const dao = generateDao({
            network: Network.POLYGON_MAINNET,
            address: '0x1b765393c3E2f3d25c44eb9Cf6B864B3fD250cDB',
            subdomain: 'poly-dao',
        });

        render(createTestComponent({ dao }));
        expect(screen.getByText(networkDefinitions[dao.network].name)).toBeInTheDocument();

        const daoAddressLink = screen.getByRole('link', { name: '0x1b76…0cDB' });
        expect(daoAddressLink).toBeInTheDocument();
        expect(daoAddressLink).toHaveAttribute('href', expect.stringMatching(dao.address));

        const daoEnsLink = screen.getByRole('link', { name: daoUtils.getDaoEns(dao) });
        expect(daoEnsLink).toBeInTheDocument();
        expect(daoEnsLink).toHaveAttribute('href', expect.stringMatching(dao.address));
    });

    it('does not render the DAO ens when missing', () => {
        const dao = generateDao({ subdomain: null });
        render(createTestComponent({ dao }));
        expect(screen.queryByText(/financeDetailsList.vaultEns/)).not.toBeInTheDocument();
    });
});
