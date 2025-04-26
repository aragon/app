import { AvatarIcon, Icon, IconType, Link, Spinner } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type {
    ITransactionStatusStepMeta,
    ITransactionStatusStepProps,
    TransactionStatusState,
} from './transactionStatusStep.api';

const stateToLabelClassName: Record<TransactionStatusState, string> = {
    pending: 'text-primary-400',
    error: 'text-critical-800',
    success: 'text-success-800',
    idle: 'text-neutral-500',
    warning: 'text-warning-800',
};

export const TransactionStatusStep = <
    TMeta extends ITransactionStatusStepMeta = ITransactionStatusStepMeta,
    TStepId extends string = string,
>(
    props: ITransactionStatusStepProps<TMeta, TStepId>,
) => {
    const { id, order, meta, className, ...otherProps } = props;
    const { addon, state, errorLabel, warningLabel, label } = meta;

    const stateLabel = state === 'error' ? errorLabel : state === 'warning' ? warningLabel : undefined;
    const processedLabel = stateLabel ?? label;

    const isLinkAddon = addon?.href != null;

    return (
        <li className={classNames('flex flex-row justify-between gap-2', className)} {...otherProps}>
            <div className="flex flex-row items-center gap-2 md:gap-3">
                {['pending', 'idle'].includes(state) && (
                    <div className="p-0.5">
                        <Spinner
                            size="md"
                            variant={state === 'pending' ? 'primary' : 'neutral'}
                            isLoading={state === 'pending'}
                        />
                    </div>
                )}
                {state === 'warning' && <AvatarIcon icon={IconType.WARNING} size="sm" variant="warning" />}
                {state === 'error' && <AvatarIcon icon={IconType.CRITICAL} size="sm" variant="critical" />}
                {state === 'success' && <AvatarIcon icon={IconType.CHECKMARK} size="sm" variant="success" />}
                <p className={classNames('text-base leading-tight font-normal', stateToLabelClassName[state])}>
                    {processedLabel}
                </p>
            </div>
            {isLinkAddon && (
                <Link href={addon.href} target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                    {addon.label}
                </Link>
            )}
            {addon != null && !isLinkAddon && (
                <div className="flex flex-row items-center gap-2">
                    <p className="text-sm leading-tight font-normal text-neutral-500 md:text-base">{addon.label}</p>
                    {addon.icon && (
                        <Icon
                            icon={IconType.BLOCKCHAIN_WALLET}
                            size="sm"
                            responsiveSize={{ md: 'md' }}
                            className="text-neutral-300"
                        />
                    )}
                </div>
            )}
        </li>
    );
};
