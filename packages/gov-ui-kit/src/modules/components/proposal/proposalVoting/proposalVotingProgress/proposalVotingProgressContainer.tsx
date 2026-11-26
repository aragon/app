import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IProposalVotingProgressContainerProps extends ComponentProps<'div'> {
    /**
     * Flex direction of the ProposalVotingProgress components. On small screens, the components will be rendered
     * in a flex column container regardeless.
     * @default row;
     */
    direction?: 'row' | 'col';
}

export const ProposalVotingProgressContainer: React.FC<IProposalVotingProgressContainerProps> = (props) => {
    const { direction = 'row', className, ...otherProps } = props;

    const colClassNames = 'flex-col *:pb-inset-surface-wide *:border-b *:border-b-surface-secondary';
    const rowClassNames =
        'md:flex-row md:*:pr-inset-surface-wide md:*:border-r md:*:pb-0 md:*:border-r-surface-secondary md:*:border-b-(--guk-bg-surface-primary)';

    const containerClassNames = classNames(
        'flex gap-section--fixed-24 rounded-xl border border-surface-secondary bg-surface-primary px-inset-surface--16-24 py-inset-surface--12-24 shadow-surface-sm',
        '[&>*:last-child]:border-none [&>*:last-child]:p-0',
        colClassNames,
        direction === 'row' && rowClassNames,
        className,
    );

    return <div className={containerClassNames} {...otherProps} />;
};
