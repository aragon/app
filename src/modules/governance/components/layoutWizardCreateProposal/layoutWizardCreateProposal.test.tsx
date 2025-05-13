import { type ILayoutWizardProps } from '@/modules/application/components/layouts/layoutWizard';
import { Network } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { mockTranslations } from '@/test/utils';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { type ILayoutWizardCreateProposalProps, LayoutWizardCreateProposal } from './layoutWizardCreateProposal';

jest.mock('@/modules/application/components/layouts/layoutWizard', () => ({
    LayoutWizard: (props: ILayoutWizardProps) => (
        <div data-testid="layout-wizard-mock">
            {typeof props.name === 'string' ? props.name : mockTranslations.tMock(...props.name)}
        </div>
    ),
}));

describe('<LayoutWizardCreateProposal /> component', () => {
    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');
    const getDaoPluginsSpy = jest.spyOn(daoUtils, 'getDaoPlugins');

    afterEach(() => {
        fetchQuerySpy.mockReset();
        getDaoPluginsSpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<ILayoutWizardCreateProposalProps>) => {
        const completeProps: ILayoutWizardCreateProposalProps = {
            params: Promise.resolve({
                addressOrEns: 'dao-address',
                network: Network.ETHEREUM_SEPOLIA,
                pluginAddress: '0x123',
            }),
            ...props,
        };

        const Component = await LayoutWizardCreateProposal(completeProps);

        return Component;
    };

    it('renders error feedback on fetch DAO error', async () => {
        fetchQuerySpy.mockImplementation(() => {
            throw new Error('fetch DAO error');
        });
        const params = { addressOrEns: 'dao-address', network: Network.ETHEREUM_SEPOLIA, pluginAddress: '0x123' };
        render(await createTestComponent({ params: Promise.resolve(params) }));
        expect(screen.getByText(/errorFeedback.title/)).toBeInTheDocument();
    });

    it('renders the plugin name on the wizard name when DAO has multiple process plugins', async () => {
        const dao = generateDao({ address: '0x987' });
        const plugins = [
            generateDaoPlugin({ subdomain: 'token', address: '0x123', isProcess: true }),
            generateDaoPlugin({ subdomain: 'multisig', address: '0x456', isProcess: true }),
        ];
        fetchQuerySpy.mockResolvedValue(generateDao());
        getDaoPluginsSpy.mockReturnValue(plugins);
        const params = { addressOrEns: dao.address, network: dao.network, pluginAddress: plugins[1].address };
        render(await createTestComponent({ params: Promise.resolve(params) }));
        expect(screen.getByText(/layoutWizardCreateProposal.namePlugin \(plugin=Multisig\)/)).toBeInTheDocument();
    });

    it('only renders the wizard name when DAO has one process plugin', async () => {
        const dao = generateDao({ address: '0x987' });
        const plugins = [generateDaoPlugin({ subdomain: 'spp', address: '0x123', isProcess: true })];
        fetchQuerySpy.mockResolvedValue(generateDao());
        getDaoPluginsSpy.mockReturnValue(plugins);
        const params = { addressOrEns: dao.address, network: dao.network, pluginAddress: plugins[0].address };
        render(await createTestComponent({ params: Promise.resolve(params) }));
        expect(screen.getByText(/layoutWizardCreateProposal.name \(plugin=Spp\)/)).toBeInTheDocument();
    });
});
