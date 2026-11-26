import {
    AddressNetworkProvider,
    AddressResolutionProvider,
    addressEntryKey,
    GukModulesProvider,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { generateDao } from '@/shared/testUtils';
import { NavigationDaoHome } from './navigationDaoHome';

describe('<NavigationDaoHome /> component', () => {
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const chainId = networkDefinitions[Network.ETHEREUM_SEPOLIA].id;
    // Bound to the DAO's network: it only resolves on a page of that network, which the address book provider sets
    // from the route.
    const entries = new Map([
        [
            addressEntryKey(address, chainId),
            { label: 'Treasury', source: 'workspace' as const },
        ],
    ]);

    const renderHome = (name: string) =>
        render(
            <GukModulesProvider>
                <AddressResolutionProvider entries={entries}>
                    <AddressNetworkProvider chainId={chainId}>
                        <NavigationDaoHome
                            dao={generateDao({
                                name,
                                address,
                                network: Network.ETHEREUM_SEPOLIA,
                            })}
                        />
                    </AddressNetworkProvider>
                </AddressResolutionProvider>
            </GukModulesProvider>,
        );

    it('shows the name of the DAO as text', () => {
        renderHome('Aragon DAO');

        expect(screen.getByText('Aragon DAO')).toBeInTheDocument();
        expect(screen.queryByText('Treasury')).not.toBeInTheDocument();
    });

    it('names an unnamed DAO by the address book, on the network of the page', () => {
        renderHome('');

        expect(screen.getByText('Treasury')).toBeInTheDocument();
    });
});
