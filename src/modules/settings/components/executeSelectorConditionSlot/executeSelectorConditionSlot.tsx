'use client';

import { DefinitionList } from '@aragon/gov-ui-kit';
import type { IConditionData } from '@/modules/settings/types';
import { useTranslations } from '@/shared/components/translationsProvider';

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0;

const toSelectorList = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter(isNonEmptyString);
};

export const ExecuteSelectorConditionSlot: React.FC<IConditionData> = (
    props,
) => {
    const { target, selectors } = props;
    const { t } = useTranslations();

    const targetLabel = isNonEmptyString(target) ? target : undefined;
    const selectorList = toSelectorList(selectors);
    const hasAllowedActions = selectorList.length > 0;

    return (
        <DefinitionList.Container>
            {targetLabel != null && (
                <DefinitionList.Item
                    term={t('app.settings.executeSelectorConditionSlot.target')}
                >
                    {targetLabel}
                </DefinitionList.Item>
            )}
            <DefinitionList.Item
                term={t(
                    'app.settings.executeSelectorConditionSlot.allowedActions',
                )}
            >
                {hasAllowedActions ? (
                    <ul>
                        {selectorList.map((selector) => (
                            <li key={selector}>{selector}</li>
                        ))}
                    </ul>
                ) : (
                    t('app.settings.executeSelectorConditionSlot.noActions')
                )}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
