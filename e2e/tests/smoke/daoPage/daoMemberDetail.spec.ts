import { DaoMembersPage, MemberDetailsPage, SMOKE_DAOS } from '@e2e/helpers';
import { expect, test } from '@playwright/test';

for (const dao of SMOKE_DAOS) {
    test(`Member detail renders [${dao.name}]`, async ({ page }) => {
        const membersPage = await new DaoMembersPage({
            page,
            network: dao.network,
            address: dao.address,
        }).navigate();

        const firstMemberLink = membersPage.firstMember();
        await expect(firstMemberLink).toBeVisible();

        const href = await firstMemberLink.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toMatch(/\/members\/0x/);

        await page.goto(href as string, { waitUntil: 'domcontentloaded' });

        const details = new MemberDetailsPage(page);
        const main = page.getByRole('main');
        await expect.soft(main).toBeVisible();
        await expect.soft(main).not.toBeEmpty();
        await expect.soft(details.detailsCard()).toBeVisible();
    });
}
