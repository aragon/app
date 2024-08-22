import type { IStepperStep } from '@/shared/utils/stepperUtils';
import { AvatarIcon, Button, Icon, IconType, Spinner } from '@aragon/ods';
import classNames from 'classnames';
import { useEffect, type ComponentProps } from 'react';
import { useTransactionStatusContext, type ITransactionStatusMeta } from '../transactionStatusProvider';

export interface ITransactionStatusStep extends IStepperStep<ITransactionStatusMeta> {}

export interface ITransactionStatusStepProps extends ITransactionStatusStep, Omit<ComponentProps<'div'>, 'id'> {}

export const TransactionStatusStep: React.FC<ITransactionStatusStepProps> = (props) => {
    const { id, order, meta, className, ...otherProps } = props;
    const { label, addon, state } = meta;

    const { registerStep } = useTransactionStatusContext();

    useEffect(() => {
        registerStep({ id, order, meta });
    }, [id, order, meta, registerStep]);

    const isLinkAddon = addon?.href != null;

    return (
        <div className={classNames('flex flex-row justify-between gap-2', className)} {...otherProps}>
            <div className="flex flex-row items-center gap-2 md:gap-3">
                {state === 'pending' && <Spinner size="md" variant="primary" />}
                {state === 'idle' && <div className="size-6 rounded-full border border-neutral-100 p-0.5" />}
                {state === 'error' && <AvatarIcon icon={IconType.CRITICAL} size="sm" variant="critical" />}
                {state === 'success' && <AvatarIcon icon={IconType.CHECKMARK} size="sm" variant="success" />}
                <p
                    className={classNames('text-base font-normal leading-tight', {
                        'text-primary-400': state === 'pending',
                        'text-critical-800': state === 'error',
                        'text-success-800': state === 'success',
                        'text-neutral-500': state === 'idle',
                    })}
                >
                    {label}
                </p>
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
