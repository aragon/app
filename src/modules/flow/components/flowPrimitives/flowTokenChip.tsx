import classNames from 'classnames';
import { FLOW_TOKENS, type FlowTokenSymbol } from '../../types';

export interface IFlowTokenChipProps {
    token: FlowTokenSymbol;
    className?: string;
}

export const FlowTokenChip: React.FC<IFlowTokenChipProps> = (props) => {
    const { token, className } = props;
    const meta = FLOW_TOKENS[token];
    return (
        <span
            className={classNames(
                'inline-flex items-center gap-1.5 rounded-full border border-neutral-100 bg-neutral-0 px-2 py-0.5 font-normal text-neutral-800 text-sm leading-tight',
                className,
            )}
        >
            <span
                aria-hidden={true}
                className="size-2 rounded-full"
                style={{ backgroundColor: meta.color }}
            />
            {token}
        </span>
    );
};
