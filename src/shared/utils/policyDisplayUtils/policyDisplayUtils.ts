import { RouterType } from '@/modules/capitalFlow/dialogs/setupStrategyDialog';
import type { IDaoPolicy } from '@/shared/api/daoService';
import {
    PolicyStrategyModelType,
    PolicyStrategySourceType,
    PolicyStrategyType,
} from '@/shared/api/daoService';

/**
 * Maps a policy's strategy configuration to the corresponding RouterType
 * used in translations and the create policy form.
 *
 * @param policy - The policy to get the router type for
 * @returns The RouterType for translation keys, or undefined if not mappable
 */
export const getPolicyRouterType = (
    policy: IDaoPolicy,
): RouterType | undefined => {
    const { strategy } = policy;

    switch (strategy.type) {
        case PolicyStrategyType.ROUTER: {
            // ROUTER can be FIXED, GAUGE, or STREAM depending on model/source
            if (strategy.model?.type === PolicyStrategyModelType.GAUGE_RATIO) {
                return RouterType.GAUGE;
            }
            if (
                strategy.source?.type ===
                PolicyStrategySourceType.STREAM_BALANCE
            ) {
                return RouterType.STREAM;
            }
            // Default to FIXED (RATIO model + DRAIN source)
            return RouterType.FIXED;
        }
        case PolicyStrategyType.BURN_ROUTER:
            return RouterType.BURN;
        case PolicyStrategyType.UNISWAP_ROUTER:
            return RouterType.UNISWAP;
        case PolicyStrategyType.COW_SWAP_ROUTER:
            return RouterType.DEX_SWAP;
        case PolicyStrategyType.MULTI_DISPATCH:
            return RouterType.MULTI_DISPATCH;
        case PolicyStrategyType.CLAIMER:
            // Claimer doesn't have a RouterType - it's a different category
            return undefined;
        default:
            return undefined;
    }
};

/**
 * Gets the strategy type key for translations.
 * Maps policy data to the shared translation key at app.capitalFlow.strategyType.[TYPE]
 */
const getStrategyTypeKey = (policy: IDaoPolicy): string => {
    const routerType = getPolicyRouterType(policy);

    if (routerType) {
        return routerType;
    }

    // Fallback for Claimer
    if (policy.strategy.type === PolicyStrategyType.CLAIMER) {
        return 'CLAIMER';
    }

    return 'FIXED'; // Default fallback
};

/**
 * Gets the translation key for a policy's strategy type label.
 *
 * @param policy - The policy to get the label translation key for
 * @returns The i18n key for the strategy type label
 */
export const getPolicyRouterTypeLabelKey = (policy: IDaoPolicy): string => {
    const typeKey = getStrategyTypeKey(policy);
    return `app.capitalFlow.strategyType.${typeKey}.label`;
};

/**
 * Gets the translation key for a policy's strategy type description.
 *
 * @param policy - The policy to get the description translation key for
 * @returns The i18n key for the strategy type description
 */
export const getPolicyRouterTypeDescriptionKey = (
    policy: IDaoPolicy,
): string => {
    const typeKey = getStrategyTypeKey(policy);
    return `app.capitalFlow.strategyType.${typeKey}.description`;
};

export const policyDisplayUtils = {
    getPolicyRouterType,
    getPolicyRouterTypeLabelKey,
    getPolicyRouterTypeDescriptionKey,
};
