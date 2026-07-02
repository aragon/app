'use client';

import { addressUtils, DefinitionList } from '@aragon/gov-ui-kit';
import type { IConditionData } from '@/modules/settings/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { stringUtils } from '@/shared/utils/stringUtils';

const EMPTY_VALUE = '—';

interface IAllowedAction {
    selector: string;
    target: string;
}

const toStringList = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter(stringUtils.isNonEmptyString) : [];

const toAllowedActions = (
    selectors: unknown,
    targets: unknown,
): IAllowedAction[] => {
    const selectorList = toStringList(selectors);
    const targetList = toStringList(targets);

    return selectorList.map((selector, index) => ({
        selector,
        target: targetList[index] ?? EMPTY_VALUE,
    }));
};

export const ExecuteSelectorConditionSlot: React.FC<IConditionData> = (
    props,
) => {
    const { selectors, targets } = props;
    const { t } = useTranslations();

    const allowedActions = toAllowedActions(selectors, targets);
    const hasAllowedActions = allowedActions.length > 0;

    return (
        <div className="flex flex-col gap-3">
            <p className="text-neutral-500">
                {t('app.settings.executeSelectorConditionSlot.description')}
            </p>
            {hasAllowedActions ? (
                <DefinitionList.Container>
                    {allowedActions.map((action) => (
                        <DefinitionList.Item
                            key={action.selector}
                            term={action.selector}
                        >
                            {action.target === EMPTY_VALUE
                                ? EMPTY_VALUE
                                : addressUtils.truncateAddress(action.target)}
                        </DefinitionList.Item>
                    ))}
                </DefinitionList.Container>
            ) : (
                <p className="text-neutral-400">
                    {t('app.settings.executeSelectorConditionSlot.noActions')}
                </p>
            )}
        </div>
    );
};
