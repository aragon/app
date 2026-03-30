import type { MetaMask } from '@synthetixio/synpress/playwright';
import { connectToDapp } from '../../utils/metamaskUtils';
import { Page } from '../page';

export class WalletConnectionPage extends Page {
    connectWallet = async (metamask: MetaMask) => {
        await this.openConnectDialog();
        await this.openWeb3ConnectDialog();
        await this.approveTermsOfCondition();
        await this.selectWallet('MetaMask');

        await connectToDapp(metamask);
    };

    private openConnectDialog = () =>
        this.page.getByRole('button', { name: 'Connect' }).click();

    private openWeb3ConnectDialog = () =>
        this.page
            .getByRole('dialog')
            .getByRole('button', { name: 'Connect' })
            .click();

    private approveTermsOfCondition = () =>
        this.page.getByTestId('wui-checkbox').locator('span').click();

    private selectWallet = (wallet: string) =>
        this.page
            .locator('wui-text')
            .filter({ hasText: wallet })
            .locator('slot')
            .click();
}
