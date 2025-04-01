import type { ITokenSetupMembershipForm } from '@/plugins/tokenPlugin/components/tokenSetupMembership';
import { NotCompatibleAlert } from '@/plugins/tokenPlugin/components/tokenSetupMembership/tokenSetupMembershipImportToken/notCompatibleAlert';
import { RequiresWrappingAlert } from '@/plugins/tokenPlugin/components/tokenSetupMembership/tokenSetupMembershipImportToken/requiresWrappingAlert';
import { useGovernanceToken } from '@/plugins/tokenPlugin/hooks/useGovernanceToken';
import { type ITransactionStatusStepMeta, TransactionStatus } from '@/shared/components/transactionStatus';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IStepperStep } from '@/shared/utils/stepperUtils';
import { AddressInput, addressUtils, Heading } from '@aragon/gov-ui-kit';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { Hash } from 'viem';
import { useAccount } from 'wagmi';

type StepState = ITransactionStatusStepMeta['state'];

export interface ITokenSetupMembershipImportTokenProps {
    /**
     * Prefix to be appended to all form fields.
     */
    formPrefix: string;
}

export const TokenSetupMembershipImportToken: React.FC<ITokenSetupMembershipImportTokenProps> = (props) => {
    const { formPrefix } = props;

    const { t } = useTranslations();

    const tokenFormPrefix = `${formPrefix}.token`;
    const { setValue } = useFormContext();
    const { chainId } = useAccount();

    // Used to prevent moving forward if the token is not set.
    useFormField<ITokenSetupMembershipForm['token'], 'name'>('name', {
        defaultValue: '',
        fieldPrefix: tokenFormPrefix,
        rules: { required: true },
    });

    const {
        onChange: onImportTokenAddressChange,
        value: importTokenAddress,
        alert,
        ...importTokenAddressField
    } = useFormField<ITokenSetupMembershipForm['token'], 'address'>('address', {
        label: t('app.plugins.token.tokenSetupMembership.importToken.label'),
        defaultValue: '',
        trimOnBlur: true,
        fieldPrefix: tokenFormPrefix,
        rules: {
            required: true,
            validate: (value) => addressUtils.isAddress(value),
        },
    });

    const { isError, isLoading, token, isDelegationCompatible, isGovernanceCompatible } = useGovernanceToken({
        address: importTokenAddress as Hash,
        chainId: chainId ?? 1,
    });

    const [tokenAddressInput, setTokenAddressInput] = useState<string | undefined>(importTokenAddress);

    useEffect(() => {
        if (!token) {
            // name is used as a required field to prevent moving forward if the token is not set!
            setValue(`${tokenFormPrefix}.name`, '');
            return;
        }

        setValue(`${tokenFormPrefix}.decimals`, token.decimals);

        if (isGovernanceCompatible) {
            setValue(`${tokenFormPrefix}.name`, token.name);
            setValue(`${tokenFormPrefix}.symbol`, token.symbol);
            setValue(`${tokenFormPrefix}.totalSupply`, token.totalSupply);
        } else {
            setValue(`${tokenFormPrefix}.name`, `Governance ${token.name}`);
            setValue(`${tokenFormPrefix}.symbol`, `g${token.symbol}`);
            setValue(`${tokenFormPrefix}.totalSupply`, '0');
        }
    }, [isGovernanceCompatible, setValue, token, tokenFormPrefix]);

    const [erc20StepState, governanceStepState, delegationStepState] = useMemo((): [
        StepState,
        StepState,
        StepState,
    ] => {
        if (isLoading) {
            return ['pending', 'pending', 'pending'];
        }

        if (isError) {
            return ['error', 'error', 'error'];
        }

        return [
            'success',
            isGovernanceCompatible ? 'success' : isGovernanceCompatible === undefined ? 'idle' : 'warning',
            isDelegationCompatible ? 'success' : isDelegationCompatible === undefined ? 'idle' : 'warning',
        ];
    }, [isDelegationCompatible, isError, isGovernanceCompatible, isLoading]);

    const steps: Array<IStepperStep<ITransactionStatusStepMeta>> = useMemo(() => {
        return [
            {
                id: 'erc20',
                order: 0,
                meta: {
                    label: 'ERC-20 token standard',
                    state: erc20StepState,
                },
            },
            {
                id: 'governance',
                order: 0,
                meta: {
                    label: 'Governance compatible',
                    state: governanceStepState,
                },
            },
            {
                id: 'delegation',
                order: 0,
                meta: {
                    label: 'Delegation compatible',
                    state: delegationStepState,
                },
            },
        ];
    }, [delegationStepState, erc20StepState, governanceStepState]);

    const isTokenCheckCardVisible = !!(importTokenAddress && !alert);
    const isNotCompatibleAlertVisible = erc20StepState === 'error';
    const isRequiresWrappingAlertVisible = !isNotCompatibleAlertVisible && governanceStepState === 'warning';

    return (
        <>
            <div className="flex flex-col gap-2 md:gap-3">
                <AddressInput
                    placeholder={t('app.plugins.token.tokenSetupMembership.importToken.placeholder')}
                    helpText={t('app.plugins.token.tokenSetupMembership.importToken.helpText')}
                    onAccept={(value) => onImportTokenAddressChange(value?.address)}
                    value={tokenAddressInput}
                    chainId={1}
                    onChange={setTokenAddressInput}
                    alert={alert}
                    {...importTokenAddressField}
                />
                {isTokenCheckCardVisible && (
                    <TransactionStatus.Container steps={steps}>
                        <Heading size="h4">{addressUtils.truncateAddress(importTokenAddress)}</Heading>
                        {steps.map((step) => (
                            <TransactionStatus.Step key={step.id} {...step} />
                        ))}
                    </TransactionStatus.Container>
                )}
            </div>
            {isNotCompatibleAlertVisible && <NotCompatibleAlert />}
            {isRequiresWrappingAlertVisible && <RequiresWrappingAlert />}
        </>
    );
};
