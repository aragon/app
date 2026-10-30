import { render, screen } from '@testing-library/react';
import * as safeSettingsDetails from '@/modules/safe/components/safeSettingsDetails';
import { Network } from '@/shared/api/daoService';
import { generateDaoPlugin } from '@/shared/testUtils';
import { PluginType } from '@/shared/types';
import { SafePluginInfo } from './safePluginInfo';

describe('<SafePluginInfo /> component', () => {
    const detailsSpy = jest.spyOn(safeSettingsDetails, 'SafeSettingsDetails');

    beforeEach(() => {
        detailsSpy.mockImplementation(() => <div data-testid="details" />);
    });

    afterEach(() => {
        detailsSpy.mockReset();
    });

    it('renders the Safe settings of the plugin', () => {
        const plugin = generateDaoPlugin({
            address: '0x1c8Cae0e29e1a0dc65f0f0E4C74DCE9f9C9F4a2B',
        });
        render(
            <SafePluginInfo
                daoId="ethereum-sepolia-0x1111111111111111111111111111111111111111"
                plugin={plugin}
                type={PluginType.BODY}
            />,
        );

        expect(screen.getByTestId('details')).toBeInTheDocument();
        expect(detailsSpy).toHaveBeenCalledWith(
            { network: Network.ETHEREUM_SEPOLIA, address: plugin.address },
            undefined,
        );
    });
});
