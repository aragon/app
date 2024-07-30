import type { IGetDaoParams } from '@/shared/api/daoService';
import * as DaoService from '@/shared/api/daoService';
import { generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { DaoVersionInfoDefinitionList } from './daoVersionInfoDefinitionList';

describe('<DaoVersionInfoDefinitionList /> component', () => {
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        useDaoSpy.mockReset();
    });
    const createTestComponent = (props?: Partial<IGetDaoParams>) => {
        const completeProps: IGetDaoParams = {
            urlParams: { id: 'test-id' },
            ...props,
        };
        return (
            <OdsModulesProvider>
                <DaoVersionInfoDefinitionList initialParams={completeProps} />
            </OdsModulesProvider>
        );
    };

    it('renders the correct terms', () => {
        const dao = generateDao({
            plugins: [
                {
                    transactionHash: '0xe4abb61f2dadc32d4aa5294fb2d9d9d7b881f59300c4bd890e006a59da62c3e6',
                    blockNumber: 16733144,
                    address: '0x899d49F22E105C2Be505FC6c19C36ABa285D437c',
                    implementationAddress: '0x78dd8358497873f8B2c4554636894cB07c20BC89',
                    tokenAddress: '0x899d49F22E105C2Be505FC6c19C36ABa285D437c',
                    pluginSetupRepoAddress: '0x8c278e37D0817210E18A7958524b7D0a1fAA6F7b',
                    release: '1',
                    build: '1',
                    subdomain: 'multisig',
                    type: '',
                },
            ],
        });

        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));

        render(createTestComponent());

        expect(screen.getByText('app.governance.daoSettingsPage.aside.daoVersionInfo.app')).toBeInTheDocument();
        expect(screen.getByText('app.governance.daoSettingsPage.aside.daoVersionInfo.os')).toBeInTheDocument();
        expect(screen.getByText('app.governance.daoSettingsPage.aside.daoVersionInfo.governance')).toBeInTheDocument();
    });

    it('renders the correct values', () => {
        const dao = generateDao({
            plugins: [
                {
                    transactionHash: '0xe4abb61f2dadc32d4aa5294fb2d9d9d7b881f59300c4bd890e006a59da62c3e6',
                    blockNumber: 16733144,
                    address: '0x899d49F22E105C2Be505FC6c19C36ABa285D437c',
                    implementationAddress: '0x78dd8358497873f8B2c4554636894cB07c20BC89',
                    tokenAddress: '0x899d49F22E105C2Be505FC6c19C36ABa285D437c',
                    pluginSetupRepoAddress: '0x8c278e37D0817210E18A7958524b7D0a1fAA6F7b',
                    release: '1',
                    build: '1',
                    subdomain: 'multisig',
                    type: '',
                },
            ],
        });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));

        render(createTestComponent());

        // TODO: Update test when we get value from the backend (APP-3484)
        expect(screen.getByText('Aragon OSx v0.00')).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.governance.daoSettingsPage.aside.daoVersionInfo.governanceLabel (name=multisig,release=1,build=1)',
            ),
        ).toBeInTheDocument();
    });

    it('renders the correct governance link', () => {
        const dao = generateDao({
            plugins: [
                {
                    transactionHash: '0xe4abb61f2dadc32d4aa5294fb2d9d9d7b881f59300c4bd890e006a59da62c3e6',
                    blockNumber: 16733144,
                    address: '0x899d49F22E105C2Be505FC6c19C36ABa285D437c',
                    implementationAddress: '0x78dd8358497873f8B2c4554636894cB07c20BC89',
                    tokenAddress: '0x899d49F22E105C2Be505FC6c19C36ABa285D437c',
                    pluginSetupRepoAddress: '0x8c278e37D0817210E18A7958524b7D0a1fAA6F7b',
                    release: '1',
                    build: '1',
                    subdomain: 'multisig',
                    type: '',
                },
            ],
        });

        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));

        render(createTestComponent());

        const linkElement = screen.getByRole('link', {
            name: 'app.governance.daoSettingsPage.aside.daoVersionInfo.governanceLabel (name=multisig,release=1,build=1) 0x89…437c',
        });

        expect(linkElement).toHaveAttribute(
            'href',
            'https://etherscan.io/address/0x899d49F22E105C2Be505FC6c19C36ABa285D437c',
        );
    });
});
