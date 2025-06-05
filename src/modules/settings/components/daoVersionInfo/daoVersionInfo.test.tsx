import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import { generateDao, generateDaoPlugin, generateTabComponentPlugin } from '@/shared/testUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { DaoVersionInfo, type IDaoVersionInfoProps } from './daoVersionInfo';

describe('<DaoVersionInfo /> component', () => {
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    beforeEach(() => {
        useDaoPluginsSpy.mockReturnValue([]);
    });

    afterEach(() => {
        useDaoPluginsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoVersionInfoProps>) => {
        const completeProps: IDaoVersionInfoProps = {
            dao: generateDao(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <DaoVersionInfo {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the correct terms', () => {
        const dao = generateDao();

        render(createTestComponent({ dao: dao }));

        expect(screen.getByText(/daoVersionInfo.osLabel/)).toBeInTheDocument();
    });

    it('renders the correct values', () => {
        const plugin = generateDaoPlugin({ release: '1', build: '3', subdomain: 'multisig' });
        const dao = generateDao({ plugins: [plugin], version: '1.3.0' });

        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ meta: plugin })]);

        render(createTestComponent({ dao: dao }));

        expect(screen.getByText(/daoVersionInfo.osValue \(version=1.3.0\)/)).toBeInTheDocument();
        expect(
            screen.getByText(/daoVersionInfo.governanceValue \(name=Multisig,release=1,build=3\)/),
        ).toBeInTheDocument();
    });

    it('renders the correct governance link', () => {
        const plugin = generateDaoPlugin({ address: '0x899d49F22E105C2Be505FC6c19C36ABa285D437c' });
        const dao = generateDao({ plugins: [plugin] });

        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ meta: plugin })]);
        render(createTestComponent({ dao: dao }));

        const linkElement = screen.getByRole('link', { name: '0x899d…437c' });
        expect(linkElement).toHaveAttribute(
            'href',
            'https://etherscan.io/address/0x899d49F22E105C2Be505FC6c19C36ABa285D437c',
        );
    });
});
