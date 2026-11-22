import { AvatarIcon, Icon, IconType, Link, Spinner } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type {
    ITransactionStatusStepMeta,
    ITransactionStatusStepProps,
    TransactionStatusState,
} from './transactionStatusStep.api';

const stateToLabelClassName: Record<TransactionStatusState, string> = {
    pending: 'text-accent-primary',
    error: 'text-critical-primary',
    success: 'text-success-primary',
    idle: 'text-surface-secondary',
    warning: 'text-warning-primary',
};

export const TransactionStatusStep = <
    TMeta extends ITransactionStatusStepMeta = ITransactionStatusStepMeta,
    TStepId extends string = string,
>(
    props: ITransactionStatusStepProps<TMeta, TStepId>,
) => {
    const { meta, className, ...otherProps } = props;
    const { addon, state, errorLabel, warningLabel, label } = meta;

    const stateLabel =
        state === 'error'
            ? errorLabel
            : state === 'warning'
              ? warningLabel
              : undefined;
    const processedLabel = stateLabel ?? label;

    const isLinkAddon = addon?.href != null;

    return (
        <li
            className={classNames(
                'flex flex-row justify-between gap-related--fixed-8',
                className,
            )}
            {...otherProps}
        >
            <div className="flex flex-row items-center gap-related--8-12">
                {['pending', 'idle'].includes(state) && (
                    <div className="p-0.5">
                        <Spinner
                            isLoading={state === 'pending'}
                            size="md"
                            variant={
                                state === 'pending' ? 'primary' : 'neutral'
                            }
                        />
                    </div>
                )}
                {state === 'warning' && (
                    <AvatarIcon
                        icon={IconType.WARNING}
                        size="sm"
                        variant="warning"
                    />
                )}
                {state === 'error' && (
                    <AvatarIcon
                        icon={IconType.CRITICAL}
                        size="sm"
                        variant="critical"
                    />
                )}
                {state === 'success' && (
                    <AvatarIcon
                        icon={IconType.CHECKMARK}
                        size="sm"
                        variant="success"
                    />
                )}
                <p
                    className={classNames(
                        'text-base leading-tight font-normal',
                        stateToLabelClassName[state],
                    )}
                >
                    {processedLabel}
                </p>
            </div>
            {isLinkAddon && (
                <Link href={addon.href} isExternal={true}>
                    {addon.label}
                </Link>
            )}
            {addon != null && !isLinkAddon && (
                <div className="flex flex-row items-center gap-related--fixed-8">
                    <p className="text-sm leading-tight font-normal text-surface-secondary md:text-base">
                        {addon.label}
                    </p>
                    {addon.icon && (
                        <Icon
                            className="icon-surface-secondary"
                            icon={IconType.BLOCKCHAIN_WALLET}
                            responsiveSize={{ md: 'md' }}
                            size="sm"
                        />
                    )}
                </div>
            )}
        </li>
    );
};
