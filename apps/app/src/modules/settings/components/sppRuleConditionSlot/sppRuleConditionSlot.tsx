'use client';

import { addressUtils, DefinitionList } from '@aragon/gov-ui-kit';
import { PermissionsDefinitionList } from '@/modules/governance/components/permissionsDefinitionList';
import { useSppPermissionCheckProposalCreation } from '@/plugins/sppPlugin/hooks/useSppPermissionCheckProposalCreation';
import type { ISppPluginSettings } from '@/plugins/sppPlugin/types';
import {
    type IDaoPermissionCondition,
    type IDaoPlugin,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { stringUtils } from '@/shared/utils/stringUtils';

interface ISppRuleConditionSlotProps extends IDaoPermissionCondition {
    /** ID of the DAO the permission belongs to, used to resolve the SPP process. */
    daoId?: string;
    /** The rule condition contract address, which equals an SPP process proposal-creation condition. */
    conditionAddress?: string;
}

/**
 * Finds the SPP process plugin whose proposal-creation condition matches a
 * rule-condition address. Backend enrichment keys `spp-rule` conditions by
 * `plugin.proposalCreationConditionAddress`, so this is the same correlation
 * used to attach the normalized rules in the first place.
 */
const findSppProcess = (
    plugins: IDaoPlugin[] | undefined,
    conditionAddress?: string,
): IDaoPlugin | undefined => {
    if (conditionAddress == null) {
        return undefined;
    }

    return plugins?.find(
        (plugin) =>
            plugin.interfaceType === PluginInterfaceType.SPP &&
            plugin.proposalCreationConditionAddress != null &&
            addressUtils.isAddressEqual(
                plugin.proposalCreationConditionAddress,
                conditionAddress,
            ),
    );
};

/**
 * Reuses the friendly proposal-creation eligibility presenter shown on process
 * details. Runs wallet-free by setting `useConnectedUserInfo: false`; only
 * `settings`, `isRestricted`, and `isLoading` are read (guards ignore
 * `hasPermission` here).
 */
const SppFriendlyCondition: React.FC<{
    daoId: string;
    plugin: IDaoPlugin<ISppPluginSettings>;
}> = ({ daoId, plugin }) => {
    const { isLoading, isRestricted, settings } =
        useSppPermissionCheckProposalCreation({
            plugin,
            daoId,
            useConnectedUserInfo: false,
        });

    return (
        <PermissionsDefinitionList
            isLoading={isLoading}
            isRestricted={isRestricted}
            settings={settings}
        />
    );
};

const DecodedRules: React.FC<{ rules: IDaoPermissionCondition['rules'] }> = ({
    rules,
}) => {
    const { t } = useTranslations();

    return (
        <div className="flex flex-col gap-3">
            <p className="text-neutral-500">
                {t('app.settings.sppRuleConditionSlot.description')}
            </p>
            {rules == null || rules.length === 0 ? (
                <p className="text-neutral-400">
                    {t('app.settings.sppRuleConditionSlot.noRules')}
                </p>
            ) : (
                <ol className="flex flex-col gap-4">
                    {rules.map((rule, index) => (
                        <li
                            className="flex flex-col gap-2"
                            key={`${rule.permissionId}-${index}`}
                        >
                            <p className="font-medium text-neutral-800">
                                {t('app.settings.sppRuleConditionSlot.rule')}{' '}
                                {index + 1}
                            </p>
                            <DefinitionList.Container>
                                <DefinitionList.Item
                                    term={t(
                                        'app.settings.sppRuleConditionSlot.type',
                                    )}
                                >
                                    {stringUtils.toPascalCase(rule.type)}
                                </DefinitionList.Item>
                                <DefinitionList.Item
                                    term={t(
                                        'app.settings.sppRuleConditionSlot.operation',
                                    )}
                                >
                                    {stringUtils.toPascalCase(rule.operation)}
                                </DefinitionList.Item>
                                <DefinitionList.Item
                                    term={t(
                                        'app.settings.sppRuleConditionSlot.value',
                                    )}
                                >
                                    <span className="break-all">
                                        {rule.value}
                                    </span>
                                </DefinitionList.Item>
                                <DefinitionList.Item
                                    copyValue={rule.permissionId}
                                    term={t(
                                        'app.settings.sppRuleConditionSlot.permissionId',
                                    )}
                                >
                                    <span className="break-all">
                                        {rule.permissionId}
                                    </span>
                                </DefinitionList.Item>
                                {rule.ruleIndexes != null &&
                                    rule.ruleIndexes.length > 0 && (
                                        <DefinitionList.Item
                                            term={t(
                                                'app.settings.sppRuleConditionSlot.ruleIndexes',
                                            )}
                                        >
                                            {rule.ruleIndexes.join(', ')}
                                        </DefinitionList.Item>
                                    )}
                                {rule.conditionAddress != null &&
                                    rule.conditionAddress !== '' && (
                                        <DefinitionList.Item
                                            copyValue={rule.conditionAddress}
                                            term={t(
                                                'app.settings.sppRuleConditionSlot.conditionAddress',
                                            )}
                                        >
                                            {addressUtils.truncateAddress(
                                                rule.conditionAddress,
                                            )}
                                        </DefinitionList.Item>
                                    )}
                            </DefinitionList.Container>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};

interface ISppProcessResolverProps {
    conditionType: string;
    conditionAddress?: string;
    daoId: string;
    rules?: IDaoPermissionCondition['rules'];
}

const SppProcessResolver: React.FC<ISppProcessResolverProps> = ({
    daoId,
    conditionAddress,
    rules,
}) => {
    const plugins = useDaoPlugins({
        daoId,
        includeSubPlugins: true,
        includeLinkedAccounts: true,
        includeUnsupported: true,
    });

    const sppProcess = findSppProcess(
        plugins?.map((plugin) => plugin.meta),
        conditionAddress,
    );

    if (sppProcess != null) {
        // Filtered to interfaceType SPP above, so its settings are the SPP
        // plugin settings the proposal-creation guard reads.
        const plugin = sppProcess as IDaoPlugin<ISppPluginSettings>;

        // The guard hook calls one hook per stage body, so its hook count is a
        // function of this plugin. Key by address so a different process
        // remounts instead of re-rendering this instance with a different hook
        // count, which React rejects.
        return (
            <SppFriendlyCondition
                daoId={daoId}
                key={plugin.address}
                plugin={plugin}
            />
        );
    }

    return <DecodedRules rules={rules} />;
};

export const SppRuleConditionSlot: React.FC<ISppRuleConditionSlotProps> = (
    props,
) => {
    const { conditionType, daoId, conditionAddress, rules } = props;

    // Resolving the process runs plugin queries, so only mount the resolver
    // when a DAO is available. Without one, fall back to the decoded rules.
    if (daoId == null) {
        return <DecodedRules rules={rules} />;
    }

    return (
        <SppProcessResolver
            conditionAddress={conditionAddress}
            conditionType={conditionType}
            daoId={daoId}
            rules={rules}
        />
    );
};
