import { forwardRef } from 'react';
import { useDao } from '../../../api/daoService';
import { AutocompleteInput } from '../../forms/autocompleteInput';
import { useTranslations } from '../../translationsProvider';
import type { IActionComposerInputProps } from './actionComposerInput.api';
import { actionComposerInputUtils } from './actionComposerInputUtils';

export const ActionComposerInput = forwardRef<HTMLInputElement, IActionComposerInputProps>((props, ref) => {
    const {
        daoId,
        onActionSelected,
        nativeItems,
        nativeGroups,
        importedContractAbis,
        isWithoutTransfer,
        isWithoutRawCalldata,
        ...otherProps
    } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const { t } = useTranslations();

    const groups = actionComposerInputUtils.getActionGroups({ t, dao, abis: importedContractAbis, nativeGroups });
    const items = actionComposerInputUtils.getActionItems({
        t,
        dao,
        abis: importedContractAbis,
        nativeItems,
        isWithoutTransfer,
        isWithoutRawCalldata,
    });

    const handleActionSelected = (itemId: string, inputValue: string) => {
        const action = items.find((item) => item.id === itemId)!;
        onActionSelected(action, inputValue);
    };

    return (
        <AutocompleteInput
            items={items}
            groups={groups}
            selectItemLabel={t('app.shared.actionComposer.selectItem')}
            placeholder={t('app.shared.actionComposer.placeholder')}
            ref={ref}
            onChange={handleActionSelected}
            {...otherProps}
        />
    );
});

ActionComposerInput.displayName = 'ActionComposerInput';
