import { Heading } from '@aragon/gov-ui-kit';
import type React from 'react';
import { type ComponentProps } from 'react';

export interface ISectionProps extends ComponentProps<'section'> {
    title: string;
}

export const Section: React.FC<ISectionProps> = ({ children, title }) => {
    return (
        <section>
            <Heading size="h1" as="h2" className="mb-4 xl:mb-6">
                {title}
            </Heading>
            {children}
        </section>
    );
};
