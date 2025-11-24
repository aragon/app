import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { addressUtils, Button, DefinitionList, Dropdown, IconType } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import {
    RouterType,
    StrategyType,
    StreamingEpochPeriod,
    type ISetupStrategyForm,
} from '../../../dialogs/setupStrategyDialog/setupStrategyDialogDefinitions';

export interface ICreatePolicyStrategyDetailsProps {
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

export const CreatePolicyStrategyDetails: React.FC<ICreatePolicyStrategyDetailsProps> = (props) => {
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
