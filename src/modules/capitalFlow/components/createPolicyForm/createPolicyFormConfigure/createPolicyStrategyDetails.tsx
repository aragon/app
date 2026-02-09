import {
    addressUtils,
    Button,
    DefinitionList,
    Dropdown,
    IconType,
} from '@aragon/gov-ui-kit';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    type ISetupStrategyForm,
    RouterType,
    StrategyType,
} from '../../../dialogs/setupStrategyDialog';

export interface ICreatePolicyStrategyDetailsProps {
    strategy: ISetupStrategyForm;
    onEdit: () => void;
    onRemove: () => void;
}

const routerTypeToDistributionField = {
    [RouterType.FIXED]: 'distributionFixed',
    [RouterType.STREAM]: 'distributionStream',
    [RouterType.GAUGE]: 'distributionGauge',
    [RouterType.BURN]: 'distributionBurn',
    [RouterType.DEX_SWAP]: 'distributionDexSwap',
    [RouterType.MULTI_DISPATCH]: 'distributionMultiDispatch',
    [RouterType.UNISWAP]: 'distributionUniswap',
} as const;

export const CreatePolicyStrategyDetails: React.FC<
    ICreatePolicyStrategyDetailsProps
> = (props) => {
    const { strategy, onEdit, onRemove } = props;
    const { t } = useTranslations();

    const { data: sourceVaultDao } = useDao(
        { urlParams: { id: strategy.sourceVault } },
        { enabled: Boolean(strategy.sourceVault) },
    );

    if (strategy.type !== StrategyType.CAPITAL_ROUTER || !sourceVaultDao) {
        return null;
    }

    const notSetLabel = t(
        'app.capitalFlow.createPolicyForm.configure.strategy.details.notSet',
    );
    const recipientsEmptyLabel = t(
        'app.capitalFlow.createPolicyForm.configure.strategy.details.recipientsEmpty',
    );

    const routerTypeLabel = t(
        `app.capitalFlow.strategyType.${strategy.routerType}.label`,
    );
    const routerTypeDescription = t(
        `app.capitalFlow.strategyType.${strategy.routerType}.description`,
    );

    const distributionField =
        routerTypeToDistributionField[strategy.routerType];
    const distribution = strategy[distributionField];
    const routerAsset =
        'asset' in distribution ? distribution.asset : undefined;

    const sourceVaultLabel = sourceVaultDao.name;
    const sourceVaultDescription =
        sourceVaultDao.ens ??
        addressUtils.truncateAddress(sourceVaultDao.address);

    const renderRecipients = () => {
        if (strategy.routerType === RouterType.MULTI_DISPATCH) {
            // Filter out empty addresses
            const validRouters =
                strategy.distributionMultiDispatch.routerAddresses.filter(
                    (router) => router.address && router.address.trim() !== '',
                );
            const routerCount = validRouters.length;
            if (routerCount === 0) {
                return (
                    <span className="text-neutral-500 text-sm">
                        {recipientsEmptyLabel}
                    </span>
                );
            }
            const translationKey =
                routerCount === 1
                    ? 'app.capitalFlow.createPolicyForm.configure.strategy.details.routerCountSingular'
                    : 'app.capitalFlow.createPolicyForm.configure.strategy.details.routerCountPlural';
            return t(translationKey, { count: routerCount });
        }

        if (
            strategy.routerType === RouterType.GAUGE ||
            strategy.routerType === RouterType.BURN ||
            strategy.routerType === RouterType.DEX_SWAP ||
            strategy.routerType === RouterType.UNISWAP
        ) {
            return 'NA';
        }

        const recipients =
            strategy.routerType === RouterType.FIXED
                ? strategy.distributionFixed.recipients
                : strategy.distributionStream.recipients;

        if (recipients.length === 0) {
            return (
                <span className="text-neutral-500 text-sm">
                    {recipientsEmptyLabel}
                </span>
            );
        }

        return t(
            'app.capitalFlow.createPolicyForm.configure.strategy.details.recipientsCount',
            {
                count: recipients.length,
            },
        );
    };

    return (
        <DefinitionList.Container className="rounded-xl border border-neutral-100 bg-neutral-0 px-6 py-4">
            <DefinitionList.Item
                description={routerTypeDescription}
                term={t(
                    'app.capitalFlow.createPolicyForm.configure.strategy.details.strategyTerm',
                )}
            >
                {routerTypeLabel}
            </DefinitionList.Item>
            <DefinitionList.Item
                description={sourceVaultDescription}
                term={t(
                    'app.capitalFlow.createPolicyForm.configure.strategy.details.sourceVault',
                )}
            >
                {sourceVaultLabel}
            </DefinitionList.Item>
            {strategy.routerType !== RouterType.MULTI_DISPATCH && (
                <DefinitionList.Item
                    term={t(
                        'app.capitalFlow.createPolicyForm.configure.strategy.details.asset',
                    )}
                >
                    {routerAsset?.token.symbol ??
                        routerAsset?.token.name ??
                        notSetLabel}
                </DefinitionList.Item>
            )}
            <DefinitionList.Item
                term={t(
                    'app.capitalFlow.createPolicyForm.configure.strategy.details.recipientsTerm',
                )}
            >
                {renderRecipients()}
            </DefinitionList.Item>
            <div className="flex w-full justify-between pt-4">
                <Button onClick={onEdit} size="md" variant="secondary">
                    {t(
                        'app.capitalFlow.createPolicyForm.configure.strategy.details.edit',
                    )}
                </Button>
                <Dropdown.Container
                    constrainContentWidth={false}
                    customTrigger={
                        <Button
                            className="w-fit"
                            iconRight={IconType.DOTS_VERTICAL}
                            size="md"
                            variant="tertiary"
                        >
                            {t(
                                'app.capitalFlow.createPolicyForm.configure.strategy.details.more',
                            )}
                        </Button>
                    }
                    size="md"
                >
                    <Dropdown.Item onClick={onRemove}>
                        {t(
                            'app.capitalFlow.createPolicyForm.configure.strategy.details.remove',
                        )}
                    </Dropdown.Item>
                </Dropdown.Container>
            </div>
        </DefinitionList.Container>
    );
};
