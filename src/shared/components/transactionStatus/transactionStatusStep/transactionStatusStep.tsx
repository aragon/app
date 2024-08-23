import { AvatarIcon, Button, Icon, IconType, invariant, Spinner } from '@aragon/ods';
import classNames from 'classnames';
import { useEffect } from 'react';
import type { ITransactionStatusStepProps } from './transactionStatusStep.api';

export const TransactionStatusStep: React.FC<ITransactionStatusStepProps> = (props) => {
    const { id, order, label, addon, state, errorLabel, registerStep, className, ...otherProps } = props;

    invariant(
        registerStep != null,
        'TransactionStatusStep: component must be used inside a TransactionStatusContainer to work properly.',
    );

    useEffect(() => {
        const meta = { label, addon, state };
        registerStep({ id, order, meta });
    }, [id, order, label, addon, state, registerStep]);

    const isLinkAddon = addon?.href != null;
    const processedLabel = state === 'error' && errorLabel != null ? errorLabel : label;

    const labelClassName = classNames('text-base font-normal leading-tight', {
        'text-primary-400': state === 'pending',
        'text-critical-800': state === 'error',
        'text-success-800': state === 'success',
        'text-neutral-500': state === 'idle',
    });

    return (
        <div className={classNames('flex flex-row justify-between gap-2', className)} {...otherProps}>
            <div className="flex flex-row items-center gap-2 md:gap-3">
                {['pending', 'idle'].includes(state) && (
                    <div className="p-0.5">
                        {state === 'pending' && <Spinner size="md" variant="primary" />}
                        {state === 'idle' && <div className="size-5 rounded-full border-2 border-neutral-100" />}
                    </div>
                )}
                {state === 'error' && <AvatarIcon icon={IconType.CRITICAL} size="sm" variant="critical" />}
                {state === 'success' && <AvatarIcon icon={IconType.CHECKMARK} size="sm" variant="success" />}
                <p className={labelClassName}>{processedLabel}</p>
            </div>
            {isLinkAddon && (
                <Button href={addon.href} target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                    {addon.text}
                </Button>
            )}
            {addon != null && !isLinkAddon && (
                <div className="flex flex-row gap-2">
                    <p className="text-sm font-normal leading-tight text-neutral-500 md:text-base">{addon.text}</p>
                    {addon.icon && <Icon icon={IconType.BLOCKCHAIN_WALLET} size="sm" responsiveSize={{ md: 'md' }} />}
                </div>
            )}
        </div>
    );
};
