'use client';

import { useDao } from '@/shared/api/daoService';
import {
    type ITransactionInfo,
    type ITransactionStatusStepMeta,
    TransactionStatus,
} from '@/shared/components/transactionStatus';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IStepperStep } from '@/shared/utils/stepperUtils';
import { AddressInput, addressUtils } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { Hex } from 'viem';
import { mainnet } from 'viem/chains';
import { useLockToVoteErc20Token } from './hooks/useLockToVoteErc20Token';
import type { ILockToVoteSetupMembershipForm, ILockToVoteSetupMembershipProps } from './lockToVoteSetupMembership.api';

export const LockToVoteSetupMembership: React.FC<ILockToVoteSetupMembershipProps> = (props) => {
    const { formPrefix, daoId } = props;
    const { t } = useTranslations();

    const tokenFormPrefix = `${formPrefix}.token`;
    const { setValue } = useFormContext();

    const useDaoParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: useDaoParams });
    const chainId = dao ? networkDefinitions[dao.network].id : undefined;

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

    const erc20StepState = isLoading ? 'pending' : isError ? 'error' : 'success';

    const getStepLabel = (step: string) =>
        t(`app.plugins.lockToVote.lockToVoteSetupMembership.importToken.step.${step}`);

    const steps: Array<IStepperStep<ITransactionStatusStepMeta>> = [
        { id: 'erc20', order: 0, meta: { label: getStepLabel('erc20'), state: erc20StepState } },
    ];

    const isTokenCheckCardVisible = !!importTokenAddress;

    const transactionInfo: ITransactionInfo = {
        title: addressUtils.truncateAddress(importTokenAddress),
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 md:gap-3">
                <AddressInput
                    helpText={t('app.plugins.lockToVote.lockToVoteSetupMembership.importToken.helpText')}
                    // Setting address to undefined could trigger some bug from the library in certain cases, so we use an empty string instead!
                    onAccept={(value) => onImportTokenAddressChange(value?.address ?? '')}
                    value={tokenAddressInput}
                    chainId={chainId}
                    onChange={setTokenAddressInput}
                    alert={alert}
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
