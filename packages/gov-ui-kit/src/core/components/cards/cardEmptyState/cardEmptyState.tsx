import classNames from 'classnames';
import { EmptyState, type IEmptyStateProps } from '../../states/emptyState';
import { Card } from '../card';

/**
 * Usage notes:
 *
 * - `CardEmptyState` forwards EmptyState props, so `primaryButton` is available in both stacked and horizontal
 *   layouts; `isStacked` changes layout and button sizing only.
 * - `className` applies to the outer full-width Card wrapper; the inner EmptyState supplies its own padding, while
 *   the Card surface itself does not add padding.
 */
export const CardEmptyState: React.FC<IEmptyStateProps> = (props) => {
    const { className, ...otherProps } = props;

    return (
        <Card className={classNames('mx-auto flex w-full justify-center', className)}>
            <EmptyState {...otherProps} />
        </Card>
    );
};
