import classNames from 'classnames';
import type { FlowPolicyStrategy } from '../../types';

export interface IFlowStrategyChipProps {
    strategy: FlowPolicyStrategy;
    className?: string;
}

export const FlowStrategyChip: React.FC<IFlowStrategyChipProps> = (props) => {
    const { strategy, className } = props;
    return (
        <span
            className={classNames(
                'inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 font-normal text-neutral-700 text-sm leading-tight',
                className,
            )}
        >
            {strategy}
        </span>
    );
};
