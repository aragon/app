import { forwardRef } from 'react';
import { useActionsContext } from '../../../../modules/governance/components/createProposalForm/actionsProvider';
import { useDao } from '../../../api/daoService';
import { AutocompleteInput } from '../../forms/autocompleteInput';
import { useTranslations } from '../../translationsProvider';
import type { IActionComposerInputProps } from './actionComposerInput.api';
import { actionComposerUtils } from './actionComposerInputUtils';

export const ActionComposerInput = forwardRef<HTMLInputElement, IActionComposerInputProps>((props, ref) => {
    const {
        daoId,
        onActionSelected,
        nativeItems,
        nativeGroups,
        isWithoutTransfer,
        isWithoutRawCalldata,
        ...otherProps
    } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const { t } = useTranslations();
    const { smartContractAbis: abis } = useActionsContext();

    const groups = actionComposerUtils.getActionGroups({ t, dao, abis, nativeGroups });
    const items = actionComposerUtils.getActionItems({
        t,
        dao,
        abis,
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
            selectItemLabel={t('app.governance.actionComposer.selectItem')}
            placeholder={t('app.governance.actionComposer.placeholder')}
            ref={ref}
            onChange={handleActionSelected}
            {...otherProps}
        />
    );
});

ActionComposerInput.displayName = 'ActionComposer';
