import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { addressUtils, Button, DefinitionList, Dropdown, IconType } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import {
    RouterType,
    StrategyType,
    type ISetupStrategyForm,
} from '../../../dialogs/setupStrategyDialog/setupStrategyDialogDefinitions';

export interface ICreatePolicyStrategyDetailsProps {
    strategy: ISetupStrategyForm;
    onEdit: () => void;
    onRemove: () => void;
}

export const CreatePolicyStrategyDetails: React.FC<ICreatePolicyStrategyDetailsProps> = (props) => {
    const { strategy, onEdit, onRemove } = props;
    const { t } = useTranslations();

    const { data: sourceVaultDao } = useDao(
        { urlParams: { id: strategy.sourceVault } },
        { enabled: Boolean(strategy.sourceVault) },
    );

    const notSetLabel = t('app.capitalFlow.createPolicyForm.configure.strategy.details.notSet');
    const recipientsEmptyLabel = t('app.capitalFlow.createPolicyForm.configure.strategy.details.recipientsEmpty');

    const routerTypeLabel =
        strategy.type === StrategyType.CAPITAL_ROUTER
            ? t(`app.capitalFlow.setupStrategyDialog.routerType.${strategy.routerType}.label`)
            : undefined;
    const routerTypeDescription =
        strategy.type === StrategyType.CAPITAL_ROUTER
            ? t(`app.capitalFlow.setupStrategyDialog.routerType.${strategy.routerType}.description`)
            : undefined;

    const routerAsset =
        strategy.type === StrategyType.CAPITAL_ROUTER
            ? strategy.routerType === RouterType.FIXED
                ? strategy.distributionFixed.asset
                : strategy.distributionStream.asset
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
        const recipients =
            strategy.routerType === RouterType.FIXED
                ? strategy.distributionFixed.recipients
                : strategy.distributionStream.recipients;

        if (recipients == null || recipients.length === 0) {
            return <span className="text-sm text-neutral-500">{recipientsEmptyLabel}</span>;
        }

        return t('app.capitalFlow.createPolicyForm.configure.strategy.details.recipientsCount', {
            count: recipients.length,
        });
    };

    return (
        <>
            <DefinitionList.Container className="bg-neutral-0 rounded-xl border border-neutral-100 px-6 py-4">
                <DefinitionList.Item
                    term={t('app.capitalFlow.createPolicyForm.configure.strategy.details.strategyTerm')}
                    description={routerTypeDescription}
                >
                    {routerTypeLabel}
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
                {strategy.type === StrategyType.CAPITAL_ROUTER && (
                    <>
                        <DefinitionList.Item
                            term={t('app.capitalFlow.createPolicyForm.configure.strategy.details.asset')}
                        >
                            {routerAsset?.token.symbol ?? routerAsset?.token.name ?? notSetLabel}
                        </DefinitionList.Item>
                        <DefinitionList.Item
                            term={t('app.capitalFlow.createPolicyForm.configure.strategy.details.recipientsTerm')}
                        >
                            {renderRecipients()}
                        </DefinitionList.Item>
                    </>
                )}
                <div className="flex w-full justify-between pt-4">
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
            </DefinitionList.Container>
        </>
    );
};
