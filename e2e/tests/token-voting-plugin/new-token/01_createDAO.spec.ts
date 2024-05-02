import {LOCALHOST_URL} from '../../../basic.setup';
import {testWithMetaMask as test} from '../../../testWithMetaMask';

// Test is creating a Token Based DAO (new token) and opens the DAO dashboard
test('Create Token Based DAO (new token)', async ({
  context,
  page,
  extensionId,
  metamask,
}) => {
  await page.goto(`${LOCALHOST_URL}/`);
  await page.getByRole('button', {name: 'Accept all'}).click();
  await page.getByRole('button', {name: 'Connect wallet'}).click();
  await page.getByRole('button', {name: 'MetaMask MetaMask'}).nth(0).click();
  await metamask.connectToDapp();
  await page.getByRole('button', {name: 'Create a DAO'}).click();
  await page.getByRole('button', {name: 'Build your DAO'}).click();
  await page.getByRole('radio', {name: 'Testnet'}).click();
  await page.getByText('Ethereum Sepolia').click();
  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByPlaceholder("Type your DAO's name …").click();
  await page
    .getByPlaceholder("Type your DAO's name …")
    .fill('Token Based DAO (new token)');
  await page.getByPlaceholder('Type your summary …').click();
  await page
    .getByPlaceholder('Type your summary …')
    .fill('DAO generated by automated E2E tests');
  await page.getByRole('button', {name: 'Next'}).click();
  await page.locator('input[name="tokenName"]').click();
  await page
    .locator('input[name="tokenName"]')
    .fill('Token Based DAO new token');
  await page.locator('input[name="tokenSymbol"]').click();
  await page.locator('input[name="tokenSymbol"]').fill('TBDnt');
  await page.getByTestId('number-input').getByPlaceholder('0').click();
  await page.getByTestId('number-input').getByPlaceholder('0').fill('1000');

  await page.getByRole('button', {name: 'Add wallet'}).click();
  await page
    .locator('div')
    .filter({hasText: /^AddressPasteTokensAllocation$/})
    .getByPlaceholder('0', {exact: true})
    .click();
  await page
    .locator('div')
    .filter({hasText: /^AddressPasteTokensAllocation$/})
    .getByPlaceholder('0', {exact: true})
    .fill('100');
  await page.locator('textarea[name="wallets\\.1"]').click();
  await page
    .locator('textarea[name="wallets\\.1"]')
    .fill('0xe0238Bb3efedf9c2ec581835D54122293740fC01');
  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByRole('button', {name: 'Next'}).click();
  await page.locator('.sc-FjLsS > .w-4').first().click();
  await page
    .locator(
      'div:nth-child(2) > .ml-auto > .md\\:flex > .sc-fbbsWf > .sc-FjLsS > .w-4'
    )
    .click();
  await page
    .locator(
      'div:nth-child(3) > .ml-auto > .md\\:flex > .sc-fbbsWf > .sc-FjLsS > .w-4'
    )
    .click();
  await page
    .locator(
      'div:nth-child(4) > .ml-auto > .md\\:flex > .sc-fbbsWf > .sc-FjLsS > .w-4'
    )
    .click();
  await page.getByRole('button', {name: 'Deploy your DAO'}).click();
  await page.getByRole('button', {name: 'Switch to Ethereum Sepolia'}).click();
  await metamask.approveSwitchNetwork();
  await page.waitForTimeout(1000);
  await page.getByRole('button', {name: 'Deploy your DAO'}).click();
  await page.getByRole('button', {name: 'Deploy DAO now'}).click();
  await metamask.confirmTransaction();
  await page.getByRole('button', {name: 'Launch DAO Dashboard'}).click();
  await page.getByRole('button', {name: 'Open your DAO'}).click();
});
