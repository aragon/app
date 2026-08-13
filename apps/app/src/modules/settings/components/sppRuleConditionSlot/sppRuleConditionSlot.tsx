'use client';

import { addressUtils, DefinitionList } from '@aragon/gov-ui-kit';
import type { IDaoPermissionCondition } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { stringUtils } from '@/shared/utils/stringUtils';

export const SppRuleConditionSlot: React.FC<IDaoPermissionCondition> = ({
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
                                {rule.ruleIndexes != null && (
                                    <DefinitionList.Item
                                        term={t(
                                            'app.settings.sppRuleConditionSlot.ruleIndexes',
                                        )}
                                    >
                                        {rule.ruleIndexes.join(', ')}
                                    </DefinitionList.Item>
                                )}
                                {rule.conditionAddress != null && (
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
