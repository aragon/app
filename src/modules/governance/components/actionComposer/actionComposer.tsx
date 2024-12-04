import { useDao } from '@/shared/api/daoService';
import { AutocompleteInput } from '@/shared/components/forms/autocompleteInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { forwardRef } from 'react';
import { useCreateProposalFormContext } from '../createProposalForm/createProposalFormProvider';
import type { IActionComposerProps } from './actionComposer.api';
import { actionComposerUtils } from './actionComposerUtils';

export const ActionComposer = forwardRef<HTMLInputElement, IActionComposerProps>((props, ref) => {
    const { daoId, onActionSelected, pluginItems, pluginGroups, mode = 'native', ...otherProps } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const { t } = useTranslations();
    const { smartContractAbis } = useCreateProposalFormContext();

    const customGroups = actionComposerUtils.getCustomActionGroups(smartContractAbis);
    const customItems = actionComposerUtils.getCustomActionItems(smartContractAbis);

    const nativeGroups = actionComposerUtils.getNativeActionGroups({ t, dao, pluginGroups });
    const nativeItems = actionComposerUtils.getNativeActionItems({ t, dao, pluginItems });

    const [items, groups] = mode === 'native' ? [nativeItems, nativeGroups] : [customItems, customGroups];

    const handleActionSelected = (itemId: string) => {
        const action = items.find((item) => item.id === itemId)!;
        onActionSelected(action.defaultValue, action.meta);
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
