import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as wagmi from 'wagmi';
import * as useWalletAccountModule from '@/modules/application/hooks/useWalletAccount';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { publishProposalDialogUtils } from '../publishProposalDialog/publishProposalDialogUtils';
import { SelectPluginDialogProcessListItem } from './selectPluginDialogProcessListItem';

describe('<SelectPluginDialogProcessListItem /> component', () => {
    const useCallSpy = jest.spyOn(wagmi, 'useCall');
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountModule,
        'useWalletAccount',
    );
    const buildTransactionSpy = jest.spyOn(
        publishProposalDialogUtils,
        'buildTransaction',
    );

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: '0xabc0000000000000000000000000000000000001',
            chainId: 1,
            isConnecting: false,
            isReconnecting: false,
        });
        useCallSpy.mockReturnValue({
            error: null,
            isError: false,
            isLoading: false,
            isSuccess: false,
        } as wagmi.UseCallReturnType);
    });

    afterEach(() => {
        useCallSpy.mockReset();
        useWalletAccountSpy.mockReset();
        buildTransactionSpy.mockReset();
    });

    it('renders a connected native Safe row without proposal simulation', async () => {
        const onEligibilityResult = jest.fn();
        const onClick = jest.fn();
        const safePlugin = generateDaoPlugin({
            interfaceType: PluginInterfaceType.SAFE,
            name: 'Native Safe',
        });

        render(
            <GukModulesProvider>
                <SelectPluginDialogProcessListItem
                    dao={generateDao()}
                    isActive={false}
                    onClick={onClick}
                    onEligibilityResult={onEligibilityResult}
                    pluginId="safe"
                    process={safePlugin}
                />
            </GukModulesProvider>,
        );

        await userEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(buildTransactionSpy).not.toHaveBeenCalled();
        await waitFor(() =>
            expect(onEligibilityResult).toHaveBeenCalledWith('safe', true),
        );
    });
});
