import { AutocompleteInput, type IAutocompleteInputProps } from '@/shared/components/forms/autocompleteInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { forwardRef, useMemo } from 'react';
import { ProposalActionType, type IProposalAction } from '../../api/governanceService';
import type { IPluginActionData } from '../createProposalForm/createProposalFormActions/createProposalFormActions.api';
import { ActionGroupId, defaultMetadataAction, defaultTransferAction } from './actionComposerDefinitions';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { useDao } from '@/shared/api/daoService';

export interface IActionComposerProps
    extends Omit<IAutocompleteInputProps, 'items' | 'groups' | 'selectItemLabel' | 'onChange'> {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Callback called on action selected.
     */
    onActionSelected: (action: IProposalAction) => void;
    /**
     * Plugin specific items.
     */
    pluginItems: IPluginActionData['items'];
    /**
     * Plugin specific groups.
     */
    pluginGroups: IPluginActionData['groups'];
}

export const ActionComposer = forwardRef<HTMLInputElement, IActionComposerProps>((props, ref) => {
    const { daoId, onActionSelected, pluginItems, pluginGroups, ...otherProps } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const { t } = useTranslations();

    const defaultMetadaAction = useMemo(() => {
        const { avatar, address, name, description, links } = dao!;
        const existingMetadata = { logo: avatar, name, description, links };

        return {
            to: address,
            existingMetadata,
            proposedMetadata: existingMetadata,
            ...defaultMetadataAction,
        };
    }, [dao]);

    const coreGroups = [
        {
            id: ActionGroupId.OSX,
            name: t(`app.governance.actionComposer.group.${ActionGroupId.OSX}`),
            info: addressUtils.truncateAddress(dao?.address),
            indexData: [dao!.address],
        },
    ];

    const coreItems = [
        {
            id: ProposalActionType.TRANSFER,
            name: t(`app.governance.actionComposer.action.${ProposalActionType.TRANSFER}`),
            icon: IconType.APP_TRANSACTIONS,
            defaultValue: defaultTransferAction,
        },
        {
            id: ProposalActionType.METADATA_UPDATE,
            name: t(`app.governance.actionComposer.action.${ProposalActionType.METADATA_UPDATE}`),
            icon: IconType.SETTINGS,
            groupId: ActionGroupId.OSX,
            defaultValue: defaultMetadaAction,
        },
    ];

    const items = [...coreItems, ...pluginItems];
    const groups = [...coreGroups, ...pluginGroups];

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
