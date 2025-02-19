import { PageAside } from './pageAside';
import { PageAsideCard } from './pageAsideCard';
import { PageContainer } from './pageContainer';
import { PageContent } from './pageContent';
import { PageError } from './pageError';
import { PageHeader } from './pageHeader';
import { PageMain } from './pageMain';
import { PageMainSection } from './pageMainSection';

export const Page = {
    Container: PageContainer,
    Header: PageHeader,
    Content: PageContent,
    Error: PageError,
    Main: PageMain,
    Aside: PageAside,
    MainSection: PageMainSection,
    AsideCard: PageAsideCard,
};

export * from './pageAside';
export * from './pageAsideCard';
export * from './pageContainer';
export * from './pageContent';
export * from './pageError';
export * from './pageHeader';
export * from './pageMain';
export * from './pageMainSection';
