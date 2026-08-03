import { addressUtils } from '@aragon/gov-ui-kit';
import type { IAllowedAction } from '@/modules/governance/api/executeSelectorsService';
import { stringUtils } from '@/shared/utils/stringUtils';

export const EMPTY_ALLOWED_ACTION_VALUE = '—';

export interface IRawAllowedAction {
    selector: string | null;
    target: string;
}

export interface IAllowedActionView {
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

export const toAllowedActions = (
    selectors: unknown,
    targets: unknown,
): IRawAllowedAction[] => {
    const selectorList = toSelectorList(selectors);
    const targetList = toTargetList(targets);

    return selectorList.map((selector, index) => ({
        selector,
        target: targetList[index] ?? EMPTY_ALLOWED_ACTION_VALUE,
    }));
};

export const toAllowedActionViews = (
    actions: IRawAllowedAction[],
): IAllowedActionView[] =>
    actions.map((action, index) => ({
        ...action,
        id: `${action.selector ?? 'any'}-${action.target}-${index}`,
        functionName: action.selector ?? undefined,
    }));

export const hasDecodedAllowedAction = (
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
