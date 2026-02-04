import { addressUtils } from '@aragon/gov-ui-kit';
import {
    type IDao,
    type IDaoPolicy,
    PolicyStrategyModelType,
    PolicyStrategyType,
} from '@/shared/api/daoService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { policyDisplayUtils } from '@/shared/utils/policyDisplayUtils';

export interface IPolicySettingItem {
    term: string;
    value: string;
    description?: string;
    /**
     * Address for creating a link (will be converted to explorer link)
     */
    address?: string;
    /**
     * Copy value for the item
     */
    copyValue?: string;
}

/**
 * Get the display name for a policy
 */
export const getPolicyName = (
    policy: IDaoPolicy,
    t?: TranslationFunction,
): string => {
    if (policy.name && policy.name.length > 0) {
        return policy.name;
    }

    const labelKey = policyDisplayUtils.getPolicyRouterTypeLabelKey(policy);
    const typeName = t ? t(labelKey) : labelKey;
    return `${typeName} #${policy.address.slice(-4)}`;
};

interface IGetPolicySettingsParams {
    policy: IDaoPolicy;
    dao: IDao;
    t: TranslationFunction;
}

/**
 * Get policy settings formatted for the Policy Settings card
 */
export const getPolicySettingsForCard = (
    params: IGetPolicySettingsParams,
): IPolicySettingItem[] => {
    const { policy, dao, t } = params;
    const settings: IPolicySettingItem[] = [];

    // Strategy
    const labelKey = policyDisplayUtils.getPolicyRouterTypeLabelKey(policy);
    const descriptionKey =
        policyDisplayUtils.getPolicyRouterTypeDescriptionKey(policy);

    settings.push({
        term: t('app.settings.daoPolicyDetailsInfo.strategy'),
        value: t(labelKey),
        description: t(descriptionKey),
    });

    // Source
    if (policy.strategy.source) {
        const { source } = policy.strategy;

        // Check if source vault is current DAO context or a known subDAO
        const isCurrentDao =
            source.vaultAddress.toLowerCase() === dao.address.toLowerCase();
        const subDao = dao.subDaos?.find(
            (sub) =>
                sub.address.toLowerCase() === source.vaultAddress.toLowerCase(),
        );

        let sourceName: string;

        if (isCurrentDao) {
            sourceName = dao.name ?? addressUtils.truncateAddress(dao.address);
        } else if (subDao) {
            sourceName =
                subDao.name ?? addressUtils.truncateAddress(subDao.address);
        } else {
            sourceName = addressUtils.truncateAddress(source.vaultAddress);
        }

        settings.push({
            term: t('app.settings.daoPolicyDetailsInfo.source'),
            value: sourceName,
            address: source.vaultAddress,
            copyValue: source.vaultAddress,
        });
    }

    // For non-multi-dispatch, show additional details
    if (policy.strategy.type !== PolicyStrategyType.MULTI_DISPATCH) {
        // Token (if source has token)
        if (policy.strategy.source?.token) {
            const { token } = policy.strategy.source;
            settings.push({
                term: t('app.settings.daoPolicyDetailsInfo.token'),
                value: addressUtils.truncateAddress(token.address),
                description: token.symbol
                    ? `${token.name ?? token.symbol} ($${token.symbol})`
                    : undefined,
                address: token.address,
                copyValue: token.address,
            });
        }

        // Recipients (if ratio model)
        if (
            policy.strategy.model?.type === PolicyStrategyModelType.RATIO &&
            policy.strategy.model.recipients
        ) {
            const recipientCount = policy.strategy.model.recipients.length;
            settings.push({
                term: t('app.settings.daoPolicyDetailsInfo.to'),
                value: `${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}`,
            });
        }

        // Gauge voter (if gauge ratio model)
        if (
            policy.strategy.model?.type === PolicyStrategyModelType.GAUGE_RATIO
        ) {
            settings.push({
                term: t('app.settings.daoPolicyDetailsInfo.gaugeVoter'),
                value: addressUtils.truncateAddress(
                    policy.strategy.model.gaugeVoterAddress,
                ),
                address: policy.strategy.model.gaugeVoterAddress,
                copyValue: policy.strategy.model.gaugeVoterAddress,
            });
        }
    }

    return settings;
};

export const daoPolicyDetailsClientUtils = {
    getPolicyName,
    getPolicySettingsForCard,
};
