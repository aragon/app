import classNames from 'classnames';
import type { FlowTokenSymbol } from '../../types';
import { getTokenColor } from '../../utils/flowFormatters';

export interface IFlowTokenChipProps {
    token: FlowTokenSymbol;
    className?: string;
}

export const FlowTokenChip: React.FC<IFlowTokenChipProps> = (props) => {
    const { token, className } = props;
    // Use the shared getter (not raw `FLOW_TOKENS[token]`) so unknown
    // symbols — i.e. anything outside the curated USDC/MERC/WETH set,
    // which is essentially every Envio-sourced token like stETH, wstETH,
    // LDO — fall back to the neutral palette instead of crashing on
    // `undefined.color`.
    const color = getTokenColor(token);
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
                style={{ backgroundColor: color }}
            />
            {token}
        </span>
    );
};
