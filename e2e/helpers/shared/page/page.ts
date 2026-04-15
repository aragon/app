import type {
    Page as PlaywrightPage,
    Response,
    TestInfo,
} from '@playwright/test';

export interface IBasePageParams {
    page: PlaywrightPage;
    path: string;
}

export class BasePage {
    protected page: PlaywrightPage;
    protected path: string;
    protected response: Response | null = null;
    private vercelError = false;

    constructor(params: IBasePageParams) {
        this.page = params.page;
        this.path = params.path;
    }

    navigate = async () => {
        try {
            this.response = await this.page.goto(this.path, {
                waitUntil: 'domcontentloaded',
            });
            if (this.response != null && this.response.status() >= 500) {
                const vercelError =
                    await this.response.headerValue('x-vercel-error');
                this.vercelError = vercelError != null;
            }
        } catch {
            this.vercelError = true;
        }
        return this;
    };

    isVercelError = () => this.vercelError;

    attachErrorContext = async (testInfo: TestInfo) => {
        await testInfo.attach('error-screenshot', {
            body: await this.page.screenshot(),
            contentType: 'image/png',
        });

        if (this.response != null) {
            try {
                await testInfo.attach('error-response', {
                    body: await this.response.text(),
                    contentType: 'text/html',
                });
            } catch {
                // Response body may not be available (e.g. navigation timeout)
            }
        }
    };
}
