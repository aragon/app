import type { ITokenSetupMembershipForm } from '@/plugins/tokenPlugin/components/tokenSetupMembership';
import { NotCompatibleAlert } from '@/plugins/tokenPlugin/components/tokenSetupMembership/tokenSetupMembershipImportToken/notCompatibleAlert';
import { RequiresWrappingAlert } from '@/plugins/tokenPlugin/components/tokenSetupMembership/tokenSetupMembershipImportToken/requiresWrappingAlert';
import { ITransactionStatusStepMeta, TransactionStatus } from '@/shared/components/transactionStatus';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IStepperStep } from '@/shared/utils/stepperUtils';
import { AddressInput, addressUtils, Heading } from '@aragon/gov-ui-kit';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

type StepState = ITransactionStatusStepMeta['state'];

function useGovernanceToken() {
    return {
        isLoading: false,
        isError: false,
        isDelegationCompatible: false,
        isGovernanceCompatible: false,
        token: {
            symbol: 'ETH',
            totalSupply: '1000000000000000000',
            decimals: 18,
            name: 'Ethereum',
        },
    };
}

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
    const form = useForm();
    console.log('FORMM', form);
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
    console.log('importTokenAddressField', importTokenAddressField, importTokenAddress);
    const [tokenAddressInput, setTokenAddressInput] = useState<string | undefined>(importTokenAddress);

    // TODO: add useGovToken hook here
    const { isError, isLoading, token, isDelegationCompatible, isGovernanceCompatible } = useGovernanceToken();

    // Helper function to determine step state based on conditions
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
            isGovernanceCompatible ? 'success' : 'warning',
            isDelegationCompatible ? 'success' : 'warning',
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
