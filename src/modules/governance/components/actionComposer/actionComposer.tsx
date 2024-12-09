import { useDao } from '@/shared/api/daoService';
import { AutocompleteInput } from '@/shared/components/forms/autocompleteInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { forwardRef } from 'react';
import { useCreateProposalFormContext } from '../createProposalForm/createProposalFormProvider';
import type { IActionComposerProps } from './actionComposer.api';
import { actionComposerUtils } from './actionComposerUtils';

export const ActionComposer = forwardRef<HTMLInputElement, IActionComposerProps>((props, ref) => {
    const { daoId, onActionSelected, nativeItems, nativeGroups, mode = 'native', ...otherProps } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const { t } = useTranslations();
    const { smartContractAbis: abis } = useCreateProposalFormContext();

    const customGroups = actionComposerUtils.getCustomActionGroups({ t, abis });
    const customItems = actionComposerUtils.getCustomActionItems({ t, abis });

    const completeNativeGroups = actionComposerUtils.getNativeActionGroups({ t, dao, nativeGroups });
    const completeNativeItems = actionComposerUtils.getNativeActionItems({ t, dao, nativeItems });

    const [items, groups] =
        mode === 'native' ? [completeNativeItems, completeNativeGroups] : [customItems, customGroups];

    const handleActionSelected = (itemId: string) => {
        const action = items.find((item) => item.id === itemId)!;
        onActionSelected(action);
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

ActionComposer.displayName = 'ActionComposer';
