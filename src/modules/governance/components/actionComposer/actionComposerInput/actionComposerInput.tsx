import { useDao } from '@/shared/api/daoService';
import { AutocompleteInput } from '@/shared/components/forms/autocompleteInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { forwardRef, useMemo } from 'react';
import { actionComposerUtils } from '../actionComposerUtils';
import type { IActionComposerInputProps } from './actionComposerInput.api';

export const ActionComposerInput = forwardRef<HTMLInputElement, IActionComposerInputProps>((props, ref) => {
    const {
        daoId,
        onActionSelected,
        nativeItems,
        nativeGroups,
        importedContractAbis,
        excludeActionTypes,
        allowedActions,
        ...otherProps
    } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const { t } = useTranslations();

    const [groups, items] = useMemo(() => {
        if (allowedActions) {
            return actionComposerUtils.getAllowedActionGroupsAndItem({ t, dao, allowedActions });
        }

        return [
            actionComposerUtils.getActionGroups({ t, dao, abis: importedContractAbis, nativeGroups }),
            actionComposerUtils.getActionItems({
                t,
                dao,
                abis: importedContractAbis,
                nativeItems,
                excludeActionTypes,
            }),
        ];
    }, [allowedActions, dao, excludeActionTypes, importedContractAbis, nativeGroups, nativeItems, t]);

    const handleActionSelected = (itemId: string, inputValue: string) => {
        const action = items.find((item) => item.id === itemId)!;
        onActionSelected(action, inputValue);
    };

    return (
        <AutocompleteInput
            items={items}
            groups={groups}
            selectItemLabel={t('app.governance.actionComposer.input.selectItem')}
            placeholder={t('app.governance.actionComposer.input.placeholder')}
            ref={ref}
            onChange={handleActionSelected}
            {...otherProps}
        />
    );
});

ActionComposerInput.displayName = 'ActionComposerInput';
