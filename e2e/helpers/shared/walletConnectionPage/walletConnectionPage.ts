import type { MetaMask } from '@synthetixio/synpress/playwright';
import { connectToDapp } from '../../utils/metamaskUtils';
import { BasePage } from '../page';

export class WalletConnectionPage extends BasePage {
    async connectWallet(metamask: MetaMask) {
        await this.openConnectDialog();
        await this.openWeb3ConnectDialog();
        await this.approveTermsOfCondition();
        await this.selectWallet('MetaMask');

        await connectToDapp(metamask);
    }

    private async openConnectDialog() {
        await this.page.getByRole('button', { name: 'Connect' }).click();
    }

    private async openWeb3ConnectDialog() {
        await this.page
            .getByRole('dialog')
            .getByRole('button', { name: 'Connect' })
            .click();
    }

    // Reown (Web3Modal) custom elements — no better public API available.
    private async approveTermsOfCondition() {
        await this.page.getByTestId('wui-checkbox').locator('span').click();
    }

    private async selectWallet(wallet: string) {
        await this.page
            .locator('wui-text')
            .filter({ hasText: wallet })
            .locator('slot')
            .click();
    }
}
