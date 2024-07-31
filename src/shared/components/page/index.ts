import { PageAside } from './pageAside';
import { PageContainer } from './pageContainer';
import { PageContent } from './pageContent';
import { PageError } from './pageError';
import { PageHeader } from './pageHeader';
import { PageMain } from './pageMain';
import { PageSection } from './pageSection';

export const Page = {
    Container: PageContainer,
    Header: PageHeader,
    Content: PageContent,
    Error: PageError,
    Main: PageMain,
    Aside: PageAside,
    Section: PageSection,
};

export * from './pageAside';
export * from './pageContainer';
export * from './pageContent';
export * from './pageError';
export * from './pageHeader';
export * from './pageMain';
export * from './pageSection';
