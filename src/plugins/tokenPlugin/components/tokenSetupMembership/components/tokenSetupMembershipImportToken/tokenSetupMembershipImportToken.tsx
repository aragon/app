import { AddressInput, addressUtils, Link } from '@aragon/gov-ui-kit';
import { AlertCard } from '@aragon/gov-ui-kit-original';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { Hex } from 'viem';
import { mainnet } from 'viem/chains';
import type { ITokenSetupMembershipForm } from '@/plugins/tokenPlugin/components/tokenSetupMembership';
import { type ITransactionInfo, type ITransactionStatusStepMeta, TransactionStatus } from '@/shared/components/transactionStatus';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IStepperStep } from '@/shared/utils/stepperUtils';
import { useGovernanceToken } from '../../hooks/useGovernanceToken';

type StepState = ITransactionStatusStepMeta['state'];

export interface ITokenSetupMembershipImportTokenProps {
    /**
     * Prefix to be appended to all form fields.
     */
    formPrefix: string;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const TokenSetupMembershipImportToken: React.FC<ITokenSetupMembershipImportTokenProps> = (props) => {
    const { formPrefix, daoId } = props;
    const { t } = useTranslations();

    const tokenFormPrefix = `${formPrefix}.token`;
    const { setValue } = useFormContext();

    const { chainId } = useDaoChain({ daoId });

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
        fieldPrefix: tokenFormPrefix,
        rules: {
            required: true,
            validate: (value) => addressUtils.isAddress(value),
        },
        sanitizeOnBlur: false,
    });

    const { isError, isLoading, data } = useGovernanceToken({
        address: importTokenAddress as Hex,
        chainId: chainId ?? mainnet.id,
    });

    const { token, isDelegationCompatible, isGovernanceCompatible } = data;

    const [tokenAddressInput, setTokenAddressInput] = useState<string | undefined>(importTokenAddress);

    useEffect(() => {
        if (!token) {
            setValue(`${tokenFormPrefix}.name`, '');
            return;
        }

        const { name, symbol, totalSupply, decimals } = token;

        setValue(`${tokenFormPrefix}.decimals`, decimals);

        if (isGovernanceCompatible) {
            setValue(`${tokenFormPrefix}.name`, name);
            setValue(`${tokenFormPrefix}.symbol`, symbol);
            setValue(`${tokenFormPrefix}.totalSupply`, totalSupply);
        } else {
            setValue(`${tokenFormPrefix}.name`, `Governance ${name}`);
            setValue(`${tokenFormPrefix}.symbol`, `g${symbol}`);
            setValue(`${tokenFormPrefix}.totalSupply`, '0');
        }
    }, [isGovernanceCompatible, setValue, token, tokenFormPrefix]);

    const getCompatibilityState = (isCompatible: boolean | undefined): StepState => {
        if (isCompatible === undefined) {
            return 'idle';
        }

        return isCompatible ? 'success' : 'warning';
    };

    let erc20StepState: StepState = 'success';
    let governanceStepState: StepState = getCompatibilityState(isGovernanceCompatible);
    let delegationStepState: StepState = getCompatibilityState(isDelegationCompatible);

    if (isLoading) {
        erc20StepState = 'pending';
        governanceStepState = 'pending';
        delegationStepState = 'pending';
    } else if (isError) {
        erc20StepState = 'error';
        governanceStepState = 'error';
        delegationStepState = 'error';
    }

    const getStepLabel = (step: string) => t(`app.plugins.token.tokenSetupMembership.importToken.step.${step}`);

    const steps: Array<IStepperStep<ITransactionStatusStepMeta>> = [
        {
            id: 'erc20',
            order: 0,
            meta: { label: getStepLabel('erc20'), state: erc20StepState },
        },
        {
            id: 'governance',
            order: 0,
            meta: {
                label: getStepLabel('governance'),
                state: governanceStepState,
            },
        },
        {
            id: 'delegation',
            order: 0,
            meta: {
                label: getStepLabel('delegation'),
                state: delegationStepState,
            },
        },
    ];

    const isTokenCheckCardVisible = !!importTokenAddress;

    const displayAlert = isError || isGovernanceCompatible === false;
    const alertContext = isError ? 'notErc20Compatible' : 'notGovernanceCompatible';
    const alertNamespace = `app.plugins.token.tokenSetupMembership.importToken.alert.${alertContext}`;

    const transactionInfo: ITransactionInfo = {
        title: addressUtils.truncateAddress(importTokenAddress),
    };

    return (
        <>
            <div className="flex flex-col gap-2 md:gap-3">
                <AddressInput
                    alert={alert}
                    // Setting address to undefined could trigger some bug from the library in certain cases, so we use an empty string instead!
                    chainId={chainId}
                    helpText={t('app.plugins.token.tokenSetupMembership.importToken.helpText')}
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
            {displayAlert && (
                <AlertCard
                    message={t(`${alertNamespace}.message`)}
                    variant={alertContext === 'notErc20Compatible' ? 'critical' : 'warning'}
                >
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-6">
                            <p>{t(`${alertNamespace}.description1`)}</p>
                            {alertContext === 'notGovernanceCompatible' && <p>{t(`${alertNamespace}.description2`)}</p>}
                        </div>
                        <Link
                            href="https://docs.aragon.org/token-voting/1.x/importing-existent-tokens.html"
                            isExternal={true}
                            variant="neutral"
                        >
                            {t('app.plugins.token.tokenSetupMembership.importToken.alert.infoLabel')}
                        </Link>
                    </div>
                </AlertCard>
            )}
        </>
    );
};
