import classNames from 'classnames';
import type { FlowPolicyStatus } from '../../types';

export interface IFlowStatusDotProps {
    status: FlowPolicyStatus;
    className?: string;
    /**
     * When true the dot emits a soft pulse — used for live/ready states.
     */
    pulse?: boolean;
}

const statusToClass: Record<FlowPolicyStatus, string> = {
    ready: 'bg-primary-400',
    live: 'bg-success-500',
    cooldown: 'bg-warning-400',
    awaiting: 'bg-neutral-400',
    paused: 'bg-warning-600',
    never: 'bg-neutral-300',
};

const statusLabel: Record<FlowPolicyStatus, string> = {
    ready: 'Ready to dispatch',
    live: 'Streaming',
    cooldown: 'Cooldown',
    awaiting: 'Awaiting proposal',
    paused: 'Paused',
    never: 'Never dispatched',
};

export const FlowStatusDot: React.FC<IFlowStatusDotProps> = (props) => {
    const { status, className, pulse } = props;
    const shouldPulse = pulse ?? (status === 'ready' || status === 'live');
    return (
        <span
            className={classNames(
                'relative inline-flex size-2 items-center justify-center',
                className,
            )}
            role="img"
            title={`Status: ${statusLabel[status]}`}
        >
            {shouldPulse && (
                <span
                    aria-hidden={true}
                    className={classNames(
                        'absolute inset-0 animate-ping rounded-full opacity-60',
                        statusToClass[status],
                    )}
                />
            )}
            <span
                className={classNames(
                    'relative inline-block size-2 rounded-full',
                    statusToClass[status],
                )}
            />
        </span>
    );
};
