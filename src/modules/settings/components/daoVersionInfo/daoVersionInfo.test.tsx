import * as useApplicationVersion from '@/shared/hooks/useApplicationVersion';
import * as useSupportedDaoPlugin from '@/shared/hooks/useSupportedDaoPlugin';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { DaoVersionInfo, type IDaoVersionInfoProps } from './daoVersionInfo';

describe('<DaoVersionInfo /> component', () => {
    const useSupportedDaoPluginSpy = jest.spyOn(useSupportedDaoPlugin, 'useSupportedDaoPlugin');
    const useApplicationVersionSpy = jest.spyOn(useApplicationVersion, 'useApplicationVersion');

    beforeEach(() => {
        useSupportedDaoPluginSpy.mockReturnValue(undefined);
    });

    afterEach(() => {
        useSupportedDaoPluginSpy.mockReset();
        useApplicationVersionSpy.mockReset();
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
        const plugin = generateDaoPlugin({ release: '1', build: '3', subdomain: 'multisig' });
        const dao = generateDao({ plugins: [plugin] });
        const appVersion = '1.0.0';

        useSupportedDaoPluginSpy.mockReturnValue(plugin);
        useApplicationVersionSpy.mockReturnValue(appVersion);

        render(createTestComponent({ dao: dao }));

        expect(screen.getByText(appVersion)).toBeInTheDocument();
        expect(screen.getByText(/daoVersionInfo.osValue/)).toBeInTheDocument();
        expect(
            screen.getByText(/daoVersionInfo.governanceValue \(name=Multisig,release=1,build=3\)/),
        ).toBeInTheDocument();
    });

    it('renders the correct governance link', () => {
        const plugin = generateDaoPlugin({ address: '0x899d49F22E105C2Be505FC6c19C36ABa285D437c' });
        const dao = generateDao({ plugins: [plugin] });

        useSupportedDaoPluginSpy.mockReturnValue(plugin);
        render(createTestComponent({ dao: dao }));

        const linkElement = screen.getByRole('link', { name: /daoVersionInfo.governanceValue .* 0x89…437c/ });
        expect(linkElement).toHaveAttribute(
            'href',
            'https://etherscan.io/address/0x899d49F22E105C2Be505FC6c19C36ABa285D437c',
        );
    });
});
