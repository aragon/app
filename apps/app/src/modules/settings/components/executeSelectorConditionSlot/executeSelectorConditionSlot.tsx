'use client';

import {
    addressUtils,
    ChainEntityType,
    Link,
    StateSkeletonBar,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import type { IAllowedAction } from '@/modules/governance/api/executeSelectorsService';
import { useAllowedActions } from '@/modules/governance/api/executeSelectorsService';
import type { IConditionData } from '@/modules/settings/types';
import type { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { stringUtils } from '@/shared/utils/stringUtils';

const EMPTY_VALUE = '—';

interface IRawAllowedAction {
    selector: string | null;
    target: string;
}

interface IExecuteSelectorConditionSlotProps extends IConditionData {
    chainId?: number;
    conditionAddress?: string;
    network?: Network;
    pluginAddress?: string;
}

interface IAllowedActionView {
    contractName?: string;
    functionName?: string;
    id: string;
    selector: string | null;
    target: string;
}

const toSelectorList = (value: unknown): Array<string | null> =>
    Array.isArray(value)
        ? value.filter((item): item is string | null =>
              item === null ? true : stringUtils.isNonEmptyString(item),
          )
        : [];

const toTargetList = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter(stringUtils.isNonEmptyString) : [];

const toAllowedActions = (
    selectors: unknown,
    targets: unknown,
): IRawAllowedAction[] => {
    const selectorList = toSelectorList(selectors);
    const targetList = toTargetList(targets);

    return selectorList.map((selector, index) => ({
        selector,
        target: targetList[index] ?? EMPTY_VALUE,
    }));
};

const hasDecodedAllowedAction = (
    action: IAllowedAction,
    rawActions: IRawAllowedAction[],
    conditionAddress?: string,
) => {
    const matchesCondition =
        conditionAddress == null ||
        addressUtils.isAddressEqual(action.conditionAddress, conditionAddress);

    if (!matchesCondition) {
        return false;
    }

    if (rawActions.length === 0) {
        return true;
    }

    return rawActions.some(
        (rawAction) =>
            rawAction.selector === action.selector &&
            addressUtils.isAddressEqual(rawAction.target, action.target),
    );
};

const AllowedActionsList: React.FC<{
    actions: IAllowedActionView[];
    chainId?: number;
}> = ({ actions, chainId }) => {
    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    return (
        <div className="flex flex-col">
            {actions.map((action) => (
                <div
                    className="flex min-w-0 flex-col gap-1 border-neutral-100 border-b py-3 first:pt-0 last:border-b-0 last:pb-0"
                    key={action.id}
                >
                    <div className="flex min-w-0 items-center gap-2.5 leading-normal">
                        <span className="truncate text-neutral-800">
                            {action.functionName ??
                                action.selector ??
                                t(
                                    'app.settings.executeSelectorConditionSlot.anySelector',
                                )}
                        </span>
                        {action.selector != null && (
                            <span className="shrink-0 text-neutral-500">
                                {action.selector}
                            </span>
                        )}
                    </div>
                    <div className="flex min-w-0 items-center gap-2.5 text-neutral-500 leading-normal">
                        <span className="truncate">
                            {action.contractName ??
                                t(
                                    'app.settings.executeSelectorConditionSlot.unknownContract',
                                )}
                        </span>
                        {action.target === EMPTY_VALUE ? (
                            <span className="shrink-0">{EMPTY_VALUE}</span>
                        ) : (
                            <Link
                                className="w-fit shrink-0"
                                href={buildEntityUrl({
                                    type: ChainEntityType.ADDRESS,
                                    id: action.target,
                                })}
                                isExternal={true}
                            >
                                {addressUtils.truncateAddress(action.target)}
                            </Link>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const AllowedActionsSkeleton: React.FC = () => (
    <div className="flex flex-col gap-3">
        <StateSkeletonBar width="70%" />
        <StateSkeletonBar width="55%" />
        <StateSkeletonBar width="65%" />
    </div>
);

interface IDecodedAllowedActionsListProps {
    chainId?: number;
    conditionAddress?: string;
    network: Network;
    pluginAddress: string;
    rawAllowedActions: IRawAllowedAction[];
}

const DecodedAllowedActionsList: React.FC<IDecodedAllowedActionsListProps> = ({
    chainId,
    conditionAddress,
    network,
    pluginAddress,
    rawAllowedActions,
}) => {
    const { data, isLoading } = useAllowedActions({
        urlParams: { network, pluginAddress },
        queryParams: { pageSize: 50 },
    });
    const decodedAllowedActions =
        data?.pages
            .flatMap((page) => page.data)
            .filter((action) =>
                hasDecodedAllowedAction(
                    action,
                    rawAllowedActions,
                    conditionAddress,
                ),
            ) ?? [];
    const decodedAllowedActionViews = decodedAllowedActions.map((action) => ({
        contractName: action.decoded.contractName,
        functionName: action.decoded.functionName,
        id: action.id,
        selector: action.selector,
        target: action.target,
    }));

    if (isLoading) {
        return <AllowedActionsSkeleton />;
    }

    if (decodedAllowedActionViews.length > 0) {
        return (
            <AllowedActionsList
                actions={decodedAllowedActionViews}
                chainId={chainId}
            />
        );
    }

    return (
        <AllowedActionsList
            actions={toAllowedActionViews(rawAllowedActions)}
            chainId={chainId}
        />
    );
};

const toAllowedActionViews = (
    actions: IRawAllowedAction[],
): IAllowedActionView[] =>
    actions.map((action, index) => ({
        ...action,
        id: `${action.selector ?? 'any'}-${action.target}-${index}`,
        functionName: action.selector ?? undefined,
    }));

export const ExecuteSelectorConditionSlot: React.FC<IConditionData> = (
    props,
) => {
    const {
        selectors,
        targets,
        chainId,
        conditionAddress,
        network,
        pluginAddress,
    } = props as IExecuteSelectorConditionSlotProps;
    const { t } = useTranslations();

    const rawAllowedActions = toAllowedActions(selectors, targets);
    const hasRawAllowedActions = rawAllowedActions.length > 0;
    const shouldFetchDecodedActions =
        network != null && pluginAddress != null && hasRawAllowedActions;

    return (
        <div className="flex flex-col gap-3">
            <p className="text-neutral-500">
                {t('app.settings.executeSelectorConditionSlot.description')}
            </p>
            {shouldFetchDecodedActions ? (
                <DecodedAllowedActionsList
                    chainId={chainId}
                    conditionAddress={conditionAddress}
                    network={network}
                    pluginAddress={pluginAddress}
                    rawAllowedActions={rawAllowedActions}
                />
            ) : hasRawAllowedActions ? (
                <AllowedActionsList
                    actions={toAllowedActionViews(rawAllowedActions)}
                    chainId={chainId}
                />
            ) : (
                <p className="text-neutral-400">
                    {t('app.settings.executeSelectorConditionSlot.noActions')}
                </p>
            )}
        </div>
    );
};
