import type { IDao } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { DaoVersionInfo } from './daoVersionInfo';

describe('<DaoVersionInfo /> component', () => {
    const createTestComponent = (props: { dao: IDao } = { dao: generateDao({ plugins: [generateDaoPlugin()] }) }) => {
        const { dao } = props;

        return (
            <OdsModulesProvider>
                <DaoVersionInfo dao={dao} />
            </OdsModulesProvider>
        );
    };

    it('renders the correct terms', () => {
        const dao = generateDao({
            plugins: [
                {
                    address: '0x899d49F22E105C2Be505FC6c19C36ABa285D437c',
                    release: '1',
                    build: '1',
                    subdomain: 'multisig',
                    type: '',
                },
            ],
        });

        render(createTestComponent({ dao: dao }));

        expect(screen.getByText(/daoSettingsPage.aside.daoVersionInfo.app/)).toBeInTheDocument();
        expect(screen.getByText(/daoSettingsPage.aside.daoVersionInfo.osLabel/)).toBeInTheDocument();
        expect(screen.getByText(/daoSettingsPage.aside.daoVersionInfo.governanceLabel/)).toBeInTheDocument();
    });

    it('renders the correct values', () => {
        const dao = generateDao({
            plugins: [
                {
                    address: '0x899d49F22E105C2Be505FC6c19C36ABa285D437c',
                    release: '1',
                    build: '1',
                    subdomain: 'multisig',
                    type: '',
                },
            ],
        });

        render(createTestComponent({ dao: dao }));

        // TODO: Update test when we get value from the backend (APP-3484)
        expect(screen.getByText(/daoSettingsPage.aside.daoVersionInfo.osValue/)).toBeInTheDocument();
        expect(
            screen.getByText(
                /daoSettingsPage.aside.daoVersionInfo.governanceValue \(name=multisig,release=1,build=1\)/,
            ),
        ).toBeInTheDocument();
    });

    it('renders the correct governance link', () => {
        const dao = generateDao({
            plugins: [
                {
                    address: '0x899d49F22E105C2Be505FC6c19C36ABa285D437c',
                    release: '1',
                    build: '1',
                    subdomain: 'multisig',
                    type: '',
                },
            ],
        });
        render(createTestComponent({ dao: dao }));

        const linkElement = screen.getByRole('link', {
            name: /daoSettingsPage.aside.daoVersionInfo.governanceValue \(name=multisig,release=1,build=1\) 0x89…437c/,
        });

        expect(linkElement).toHaveAttribute(
            'href',
            'https://etherscan.io/address/0x899d49F22E105C2Be505FC6c19C36ABa285D437c',
        );
    });
});
