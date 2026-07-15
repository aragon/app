'use client';

import { StateSkeletonBar } from '@aragon/gov-ui-kit';
import { useAllowedActions } from '@/modules/governance/api/executeSelectorsService';
import type { Network } from '@/shared/api/daoService';
import { AllowedActionsList } from './allowedActionsList';
import {
    hasDecodedAllowedAction,
    type IRawAllowedAction,
    toAllowedActionViews,
} from './executeSelectorConditionSlotUtils';

interface IDecodedAllowedActionsListProps {
    chainId?: number;
    conditionAddress?: string;
    network: Network;
    pluginAddress: string;
    rawAllowedActions: IRawAllowedAction[];
}

const AllowedActionsSkeleton: React.FC = () => (
    <div className="flex flex-col gap-3">
        <StateSkeletonBar width="70%" />
        <StateSkeletonBar width="55%" />
        <StateSkeletonBar width="65%" />
    </div>
);

export const DecodedAllowedActionsList: React.FC<
    IDecodedAllowedActionsListProps
> = ({
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
