'use client';

import { AddressInput, addressUtils } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { Hex } from 'viem';
import { mainnet } from 'viem/chains';
import { type ITransactionInfo, type ITransactionStatusStepMeta, TransactionStatus } from '@/shared/components/transactionStatus';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IStepperStep } from '@/shared/utils/stepperUtils';
import { useLockToVoteErc20Token } from './hooks/useLockToVoteErc20Token';
import type { ILockToVoteSetupMembershipForm, ILockToVoteSetupMembershipProps } from './lockToVoteSetupMembership.api';

export const LockToVoteSetupMembership: React.FC<ILockToVoteSetupMembershipProps> = (props) => {
    const { formPrefix, daoId } = props;
    const { t } = useTranslations();

    const tokenFormPrefix = `${formPrefix}.token`;
    const { setValue } = useFormContext();

    const { chainId } = useDaoChain({ daoId });

    useFormField<ILockToVoteSetupMembershipForm['token'], 'name'>('name', {
        defaultValue: '',
        fieldPrefix: tokenFormPrefix,
        rules: { required: true },
    });

    const {
        onChange: onImportTokenAddressChange,
        value: importTokenAddress,
        alert,
        ...importTokenAddressField
    } = useFormField<ILockToVoteSetupMembershipForm['token'], 'address'>('address', {
        label: t('app.plugins.lockToVote.lockToVoteSetupMembership.importToken.label'),
        defaultValue: '',
        fieldPrefix: tokenFormPrefix,
        rules: {
            required: true,
            validate: (value) => addressUtils.isAddress(value),
        },
        sanitizeOnBlur: false,
    });

    const {
        isError,
        isLoading,
        data: token,
    } = useLockToVoteErc20Token({
        address: importTokenAddress as Hex,
        chainId: chainId ?? mainnet.id,
    });

    const [tokenAddressInput, setTokenAddressInput] = useState<string | undefined>(importTokenAddress);

    useEffect(() => {
        if (!token) {
            setValue(`${tokenFormPrefix}.name`, '');
            return;
        }

        const { name, symbol, totalSupply, decimals } = token;

        setValue(`${tokenFormPrefix}.decimals`, decimals);

        setValue(`${tokenFormPrefix}.name`, name);
        setValue(`${tokenFormPrefix}.symbol`, symbol);
        setValue(`${tokenFormPrefix}.totalSupply`, totalSupply);
    }, [setValue, token, tokenFormPrefix]);

    let erc20StepState: ITransactionStatusStepMeta['state'] = 'success';
    if (isLoading) {
        erc20StepState = 'pending';
    } else if (isError) {
        erc20StepState = 'error';
    }

    const getStepLabel = (step: string) => t(`app.plugins.lockToVote.lockToVoteSetupMembership.importToken.step.${step}`);

    const steps: Array<IStepperStep<ITransactionStatusStepMeta>> = [
        {
            id: 'erc20',
            order: 0,
            meta: { label: getStepLabel('erc20'), state: erc20StepState },
        },
    ];

    const isTokenCheckCardVisible = !!importTokenAddress;

    const transactionInfo: ITransactionInfo = {
        title: addressUtils.truncateAddress(importTokenAddress),
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 md:gap-3">
                <AddressInput
                    alert={alert}
                    // Setting address to undefined could trigger some bug from the library in certain cases, so we use an empty string instead!
                    chainId={chainId}
                    helpText={t('app.plugins.lockToVote.lockToVoteSetupMembership.importToken.helpText')}
                    onAccept={(value) => onImportTokenAddressChange(value?.address ?? '')}
                    onChange={setTokenAddressInput}
                    value={tokenAddressInput}
                    {...importTokenAddressField}
                />
                {isTokenCheckCardVisible && (
                    <TransactionStatus.Container steps={steps} transactionInfo={transactionInfo}>
                        {steps.map((step) => (
                            <TransactionStatus.Step key={step.id} {...step} />
                        ))}
                    </TransactionStatus.Container>
                )}
            </div>
        </div>
    );
};
