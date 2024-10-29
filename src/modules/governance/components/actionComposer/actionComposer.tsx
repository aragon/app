import { AutocompleteInput, type IAutocompleteInputProps } from '@/shared/components/forms/autocompleteInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { forwardRef } from 'react';
import { type IProposalAction } from '../../api/governanceService';
import type { IPluginActionData } from '../createProposalForm/createProposalFormActions/createProposalFormActions.api';

export interface IActionComposerProps
    extends Omit<IAutocompleteInputProps, 'items' | 'groups' | 'selectItemLabel' | 'onChange'> {
    /**
     * Callback called on action selected.
     */
    onActionSelected: (action: IProposalAction) => void;
    /**
     * All action items, both plugin specific and plugin agnostic.
     */
    items: IPluginActionData['items'];
    /**
     * All action groups, both plugin specific and plugin agnostic.
     */
    groups: IPluginActionData['groups'];
}

export const ActionComposer = forwardRef<HTMLInputElement, IActionComposerProps>((props, ref) => {
    const { onActionSelected, items, groups, ...otherProps } = props;

    const { t } = useTranslations();

    const handleActionSelected = (itemId: string) => {
        const action = items.find((item) => item.id === itemId)!;
        onActionSelected?.(action.defaultValue);
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
