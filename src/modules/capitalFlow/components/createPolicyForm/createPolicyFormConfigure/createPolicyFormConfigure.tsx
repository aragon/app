import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    addressUtils,
    Button,
    CardEmptyState,
    DefinitionList,
    Dropdown,
    IconType,
    InputContainer,
} from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { FieldPath, useFormContext } from 'react-hook-form';
import { CapitalFlowDialogId } from '../../../constants/capitalFlowDialogId';
import type { ISetupStrategyDialogParams } from '../../../dialogs/setupStrategyDialog';
import {
    RouterType,
    StrategyType,
    StreamingEpochPeriod,
    type ISetupStrategyForm,
} from '../../../dialogs/setupStrategyDialog/setupStrategyDialogDefinitions';
import type { ICreatePolicyFormData } from '../createPolicyFormDefinitions';

export interface ICreatePolicyFormConfigureProps {
    /**
     * Prefix to prepend to all the metadata form fields.
     */
    fieldPrefix?: string;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const CreatePolicyFormConfigure: React.FC<ICreatePolicyFormConfigureProps> = (props) => {
    const { fieldPrefix, daoId } = props;
    const strategyFieldName = fieldPrefix != null ? `${fieldPrefix}.strategy` : 'strategy';

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const { setValue } = useFormContext<ICreatePolicyFormData>();

    const setSelectedStrategy = (strategy: ISetupStrategyForm) => {
        setValue(strategyFieldName as FieldPath<ICreatePolicyFormData>, strategy, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    };

    const { value: selectedStrategy, alert } = useFormField<ICreatePolicyFormData, 'strategy'>('strategy', {
        label: t('app.capitalFlow.createPolicyForm.configure.strategy.label'),
        rules: {
            required: true,
        },
        fieldPrefix,
    });

    const handleOpenStrategyDialog = () => {
        const params: ISetupStrategyDialogParams = {
            daoId,
            onSubmit: (strategy: ISetupStrategyForm) => {
                setSelectedStrategy(strategy);
                close(CapitalFlowDialogId.SETUP_STRATEGY);
            },
            initialValues: selectedStrategy,
        };

        open(CapitalFlowDialogId.SETUP_STRATEGY, { params });
    };

    const handleRemoveStrategy = () => {
        setValue(strategyFieldName as FieldPath<ICreatePolicyFormData>, undefined, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    };

    return (
        <>
            <InputContainer
                id="policyStrategy"
                label={t('app.capitalFlow.createPolicyForm.configure.strategy.label')}
                helpText={t('app.capitalFlow.createPolicyForm.configure.strategy.helpText')}
                useCustomWrapper={true}
                alert={alert}
            >
                {selectedStrategy == null ? (
                    <CardEmptyState
                        heading={t('app.capitalFlow.createPolicyForm.configure.strategy.emptyCard.heading')}
                        description={t('app.capitalFlow.createPolicyForm.configure.strategy.emptyCard.description')}
                        objectIllustration={{ object: 'SETTINGS' }}
                        secondaryButton={{
                            label: t('app.capitalFlow.createPolicyForm.configure.strategy.emptyCard.action'),
                            onClick: handleOpenStrategyDialog,
                            iconLeft: IconType.PLUS,
                        }}
                        isStacked={false}
                        className="border border-neutral-100"
                    />
                ) : (
                    <CreatePolicyStrategyDetails
                        strategy={selectedStrategy}
                        onEdit={handleOpenStrategyDialog}
                        onRemove={handleRemoveStrategy}
                    />
                )}
            </InputContainer>
        </>
    );
};

interface ICreatePolicyStrategyDetailsProps {
    strategy: ISetupStrategyForm;
    onEdit: () => void;
    onRemove: () => void;
}

const strategyTypeLabelMap: Record<StrategyType, string> = {
    [StrategyType.CAPITAL_ROUTER]: 'capitalRouter',
    [StrategyType.CAPITAL_DISTRIBUTOR]: 'capitalDistributor',
    [StrategyType.DEFI_ADAPTER]: 'defiAdapter',
};

const routerTypeLabelMap: Record<RouterType, string> = {
    [RouterType.FIXED]: 'fixed',
    [RouterType.STREAM]: 'stream',
};

const streamingPeriodLabelMap: Record<StreamingEpochPeriod, string> = {
    [StreamingEpochPeriod.HOUR]: 'hour',
    [StreamingEpochPeriod.DAY]: 'day',
    [StreamingEpochPeriod.WEEK]: 'week',
};

const CreatePolicyStrategyDetails: React.FC<ICreatePolicyStrategyDetailsProps> = (props) => {
    const { strategy, onEdit, onRemove } = props;
    const { t } = useTranslations();

    const { data: sourceVaultDao } = useDao(
        { urlParams: { id: strategy.sourceVault } },
        { enabled: Boolean(strategy.sourceVault) },
    );

    const notSetLabel = t('app.capitalFlow.createPolicyForm.configure.strategy.details.notSet');
    const recipientsEmptyLabel = t('app.capitalFlow.createPolicyForm.configure.strategy.details.recipientsEmpty');

    const strategyTypeKey = strategyTypeLabelMap[strategy.type];
    const strategyTypeLabel = strategyTypeKey
        ? t(`app.capitalFlow.setupStrategyDialog.select.${strategyTypeKey}.label`)
        : strategy.type;

    const routerTypeLabel =
        strategy.type === StrategyType.CAPITAL_ROUTER
            ? t(`app.capitalFlow.setupStrategyDialog.routerType.${routerTypeLabelMap[strategy.routerType]}.label`)
            : undefined;

    const routerAsset =
        strategy.type === StrategyType.CAPITAL_ROUTER
            ? strategy.routerType === RouterType.FIXED
                ? strategy.distributionFixed.asset
                : strategy.distributionStream.asset
            : undefined;

    const streamCadenceLabel =
        strategy.type === StrategyType.CAPITAL_ROUTER && strategy.routerType === RouterType.STREAM
            ? t(
                  `app.capitalFlow.setupStrategyDialog.distributionStream.epochPeriod.${
                      streamingPeriodLabelMap[strategy.distributionStream.epochPeriod]
                  }`,
              )
            : undefined;

    const sourceVaultFallbackAddress = useMemo(() => {
        const { address } = daoUtils.parseDaoId(strategy.sourceVault);
        return addressUtils.truncateAddress(address);
    }, [strategy.sourceVault]);

    const sourceVaultLabel = sourceVaultDao?.name ?? strategy.sourceVault;
    const sourceVaultDescription = sourceVaultDao?.ens ?? sourceVaultDao?.address ?? sourceVaultFallbackAddress;

    const renderRecipients = () => {
        if (strategy.type !== StrategyType.CAPITAL_ROUTER) {
            return <span className="text-sm text-neutral-500">{recipientsEmptyLabel}</span>;
        }

        if (strategy.routerType === RouterType.FIXED) {
            const fixedRecipients = strategy.distributionFixed.recipients;

            if (fixedRecipients == null || fixedRecipients.length === 0) {
                return <span className="text-sm text-neutral-500">{recipientsEmptyLabel}</span>;
            }

            return (
                <ul className="flex flex-col gap-2">
                    {fixedRecipients.map((recipient, index) => {
                        const recipientLabel = recipient.address
                            ? addressUtils.truncateAddress(recipient.address)
                            : notSetLabel;
                        const valueLabel = recipient.ratio != null ? `${recipient.ratio}%` : notSetLabel;

                        return (
                            <li key={`${recipient.address ?? 'recipient'}-${index}`} className="flex flex-col">
                                <span className="text-sm font-medium text-neutral-800">{recipientLabel}</span>
                                <span className="text-sm text-neutral-500">{valueLabel}</span>
                            </li>
                        );
                    })}
                </ul>
            );
        }

        const streamRecipients = strategy.distributionStream.recipients;

        if (streamRecipients == null || streamRecipients.length === 0) {
            return <span className="text-sm text-neutral-500">{recipientsEmptyLabel}</span>;
        }

        return (
            <ul className="flex flex-col gap-2">
                {streamRecipients.map((recipient, index) => {
                    const recipientLabel = recipient.address
                        ? addressUtils.truncateAddress(recipient.address)
                        : notSetLabel;
                    const amountValue = recipient.amount ?? undefined;
                    const amountText = amountValue != null ? `${amountValue}` : undefined;
                    const valueLabel = amountText
                        ? `${amountText}${routerAsset?.token.symbol ? ` ${routerAsset.token.symbol}` : ''}`
                        : notSetLabel;

                    return (
                        <li key={`${recipient.address ?? 'recipient'}-${index}`} className="flex flex-col">
                            <span className="text-sm font-medium text-neutral-800">{recipientLabel}</span>
                            <span className="text-sm text-neutral-500">{valueLabel}</span>
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <>
            <DefinitionList.Container className="bg-neutral-0 rounded-xl border border-neutral-100 px-6 py-4">
                <DefinitionList.Item
                    term={t('app.capitalFlow.createPolicyForm.configure.strategy.details.strategyType')}
                >
                    {strategyTypeLabel}
                </DefinitionList.Item>
                <DefinitionList.Item
                    term={t('app.capitalFlow.createPolicyForm.configure.strategy.details.sourceVault')}
                >
                    <div className="flex flex-col">
                        <span className="text-base text-neutral-800">{sourceVaultLabel}</span>
                        {sourceVaultDescription && (
                            <span className="text-sm text-neutral-500">{sourceVaultDescription}</span>
                        )}
                    </div>
                </DefinitionList.Item>
                {routerTypeLabel && (
                    <DefinitionList.Item
                        term={t('app.capitalFlow.createPolicyForm.configure.strategy.details.routerType')}
                    >
                        {routerTypeLabel}
                    </DefinitionList.Item>
                )}
                {strategy.type === StrategyType.CAPITAL_ROUTER && (
                    <>
                        <DefinitionList.Item
                            term={t('app.capitalFlow.createPolicyForm.configure.strategy.details.asset')}
                        >
                            {routerAsset?.token.symbol ?? routerAsset?.token.name ?? notSetLabel}
                        </DefinitionList.Item>
                        {strategy.routerType === RouterType.STREAM && (
                            <DefinitionList.Item
                                term={t('app.capitalFlow.createPolicyForm.configure.strategy.details.streamCadence')}
                            >
                                {streamCadenceLabel ?? notSetLabel}
                            </DefinitionList.Item>
                        )}
                        <DefinitionList.Item
                            term={t('app.capitalFlow.createPolicyForm.configure.strategy.details.recipients')}
                        >
                            {renderRecipients()}
                        </DefinitionList.Item>
                    </>
                )}
            </DefinitionList.Container>
            <div className="flex w-full justify-between">
                <Button variant="secondary" size="md" onClick={onEdit}>
                    {t('app.capitalFlow.createPolicyForm.configure.strategy.details.edit')}
                </Button>
                <Dropdown.Container
                    constrainContentWidth={false}
                    size="md"
                    customTrigger={
                        <Button className="w-fit" variant="tertiary" size="md" iconRight={IconType.DOTS_VERTICAL}>
                            {t('app.capitalFlow.createPolicyForm.configure.strategy.details.more')}
                        </Button>
                    }
                >
                    <Dropdown.Item onClick={onRemove}>
                        {t('app.capitalFlow.createPolicyForm.configure.strategy.details.remove')}
                    </Dropdown.Item>
                </Dropdown.Container>
            </div>
        </>
    );
};
