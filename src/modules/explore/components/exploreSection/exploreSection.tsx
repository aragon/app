import { Heading } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { type ComponentProps } from 'react';

export interface IExploreSectionProps extends ComponentProps<'section'> {
    /**
     * Title of the section.
     */
    title: string;
}

export const ExploreSection: React.FC<IExploreSectionProps> = (props) => {
    const { children, title, className, ...otherProps } = props;

    return (
        <section className={classNames('flex flex-col gap-4 md:gap-6', className)} {...otherProps}>
            <Heading size="h1" as="h2">
                {title}
            </Heading>
            {children}
        </section>
    );
};
