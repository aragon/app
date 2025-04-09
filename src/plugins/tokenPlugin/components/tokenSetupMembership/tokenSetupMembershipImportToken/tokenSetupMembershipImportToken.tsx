import type { ITokenSetupMembershipForm } from '@/plugins/tokenPlugin/components/tokenSetupMembership';
import { useGovernanceToken } from '@/plugins/tokenPlugin/hooks/useGovernanceToken';
import { useDao } from '@/shared/api/daoService';
import { type ITransactionStatusStepMeta, TransactionStatus } from '@/shared/components/transactionStatus';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IStepperStep } from '@/shared/utils/stepperUtils';
import { AddressInput, addressUtils, IconType, Link } from '@aragon/gov-ui-kit';
import { AlertCard } from '@aragon/gov-ui-kit-original';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { Hash } from 'viem';

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

    const useDaoParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: useDaoParams });
    const chainId = dao ? networkDefinitions[dao.network].id : undefined;

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

    const getCompatibilityState = (isCompatible: boolean | undefined): StepState =>
        isCompatible ? 'success' : isCompatible === undefined ? 'idle' : 'warning';

    const [erc20StepState, governanceStepState, delegationStepState]: [StepState, StepState, StepState] = isLoading
        ? ['pending', 'pending', 'pending']
        : isError
          ? ['error', 'error', 'error']
          : ['success', getCompatibilityState(isGovernanceCompatible), getCompatibilityState(isDelegationCompatible)];

    const getStepLabel = (step: string) => t(`app.plugins.token.tokenSetupMembership.importToken.step.${step}`);

    const steps: Array<IStepperStep<ITransactionStatusStepMeta>> = [
        { id: 'erc20', order: 0, meta: { label: getStepLabel('erc20'), state: erc20StepState } },
        { id: 'governance', order: 0, meta: { label: getStepLabel('governance'), state: governanceStepState } },
        { id: 'delegation', order: 0, meta: { label: getStepLabel('delegation'), state: delegationStepState } },
    ];

    const isTokenCheckCardVisible = !!importTokenAddress;

    const displayAlert = isError || isGovernanceCompatible === false;
    const alertContext = isError ? `notErc20Compatible` : `notGovernanceCompatible`;
    const alertNamespace = `app.plugins.token.tokenSetupMembership.importToken.alert.${alertContext}`;

    return (
        <>
            <div className="flex flex-col gap-2 md:gap-3">
                <AddressInput
                    placeholder={t('app.plugins.token.tokenSetupMembership.importToken.placeholder')}
                    helpText={t('app.plugins.token.tokenSetupMembership.importToken.helpText')}
                    // Setting address to undefined could trigger some bug from the library in certain cases, so we use an empty string instead!
                    onAccept={(value) => onImportTokenAddressChange(value?.address ?? '')}
                    value={tokenAddressInput}
                    chainId={chainId}
                    onChange={setTokenAddressInput}
                    alert={alert}
                    {...importTokenAddressField}
                />
                {isTokenCheckCardVisible && (
                    <TransactionStatus.Container steps={steps}>
                        <TransactionStatus.Title title={addressUtils.truncateAddress(importTokenAddress)} />
                        {steps.map((step) => (
                            <TransactionStatus.Step key={step.id} {...step} />
                        ))}
                    </TransactionStatus.Container>
                )}
            </div>
            {displayAlert && (
                <AlertCard
                    variant={alertContext === 'notErc20Compatible' ? 'critical' : 'warning'}
                    message={t(`${alertNamespace}.message`)}
                >
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-6">
                            <p>{t(`${alertNamespace}.description1`)}</p>
                            {alertContext === 'notGovernanceCompatible' && <p>{t(`${alertNamespace}.description2`)}</p>}
                        </div>
                        <Link
                            href="https://docs.aragon.org/token-voting/1.x/importing-existent-tokens.html"
                            target="_blank"
                            iconRight={IconType.LINK_EXTERNAL}
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
