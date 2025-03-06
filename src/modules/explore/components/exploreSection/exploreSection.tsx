import { Heading } from '@aragon/gov-ui-kit';
import type React from 'react';
import { type ComponentProps } from 'react';

export interface IExploreSectionProps extends ComponentProps<'section'> {
    /**
     * Title of the section.
     */
    title: string;
}

export const ExploreSection: React.FC<IExploreSectionProps> = ({ children, title }) => {
    return (
        <section>
            <Heading size="h1" as="h2" className="mb-4 xl:mb-6">
                {title}
            </Heading>
            {children}
        </section>
    );
};
