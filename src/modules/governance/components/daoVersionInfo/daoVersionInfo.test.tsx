import { generateDao, generateDaoPlugin, generatePlugin } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { DaoVersionInfo, type IDaoVersionInfoProps } from './daoVersionInfo';

describe('<DaoVersionInfo /> component', () => {
    const originalProcessEnv = process.env;
    const getPluginSpy = jest.spyOn(pluginRegistryUtils, 'getPlugin');

    afterEach(() => {
        getPluginSpy.mockReset();
        process.env = originalProcessEnv;
    });
    const createTestComponent = (props?: Partial<IDaoVersionInfoProps>) => {
        const completeProps: IDaoVersionInfoProps = {
            dao: generateDao(),
            ...props,
        };

        return (
            <OdsModulesProvider>
                <DaoVersionInfo {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('renders the correct terms', () => {
        const dao = generateDao();

        render(createTestComponent({ dao: dao }));

        expect(screen.getByText(/daoVersionInfo.app/)).toBeInTheDocument();
        expect(screen.getByText(/daoVersionInfo.osLabel/)).toBeInTheDocument();
    });

    it('renders the correct values', () => {
        process.env.version = '1.0.0';
        process.env.NEXT_PUBLIC_ENV = 'development';
        const plugin = generateDaoPlugin({
            address: '0x899d49F22E105C2Be505FC6c19C36ABa285D437c',
            release: '1',
            build: '3',
            subdomain: 'multisig',
            type: '',
        });
        const dao = generateDao({ plugins: [plugin] });

        getPluginSpy.mockReturnValue(generatePlugin());

        render(createTestComponent({ dao: dao }));

        expect(
            screen.getByText(/shared.useApplicationVersion.versionEnv \(version=1.0.0,env=DEV\)/),
        ).toBeInTheDocument();
        // TODO: Update test when we get value from the backend (APP-3484)
        expect(screen.getByText(/daoVersionInfo.osValue/)).toBeInTheDocument();
        expect(
            screen.getByText(/daoVersionInfo.governanceValue \(name=multisig,release=1,build=3\)/),
        ).toBeInTheDocument();
    });

    it('renders the correct governance link', () => {
        const dao = generateDao({
            plugins: [
                {
                    address: '0x899d49F22E105C2Be505FC6c19C36ABa285D437c',
                    release: '3',
                    build: '5',
                    subdomain: 'multisig',
                    type: '',
                },
            ],
        });

        getPluginSpy.mockReturnValue(generatePlugin());

        render(createTestComponent({ dao: dao }));

        const linkElement = screen.getByRole('link', {
            name: /daoVersionInfo.governanceValue \(name=multisig,release=3,build=5\) 0x89…437c/,
        });

        expect(linkElement).toHaveAttribute(
            'href',
            'https://etherscan.io/address/0x899d49F22E105C2Be505FC6c19C36ABa285D437c',
        );
    });
});
