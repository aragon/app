import type { Page as PlaywrightPage } from '@playwright/test';

export interface IPageParams {
    page: PlaywrightPage;
    path: string;
}

export class Page {
    protected page: PlaywrightPage;
    protected path: string;

    constructor(params: IPageParams) {
        this.page = params.page;
        this.path = params.path;
    }

    navigate = async () => {
        await this.page.goto(this.path);
        return this;
    };
}
