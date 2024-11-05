import { useDao } from '@/shared/api/daoService';
import { AutocompleteInput, type IAutocompleteInputProps } from '@/shared/components/forms/autocompleteInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { forwardRef, useMemo } from 'react';
import { ProposalActionType, type IProposalAction } from '../../api/governanceService';
import type { IPluginActionComposerData } from './actionComposer.api';
import { ActionGroupId, defaultMetadataAction, defaultTransferAction } from './actionComposerDefinitions';

export interface IActionComposerProps
    extends Omit<IAutocompleteInputProps, 'items' | 'groups' | 'selectItemLabel' | 'onChange'> {
    /**
     * Callback called on action selected.
     */
    onActionSelected: (action: IProposalAction) => void;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Plugin specific items.
     */
    pluginItems: IPluginActionComposerData['items'];
    /**
     * Plugin specific groups.
     */
    pluginGroups: IPluginActionComposerData['groups'];
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

    const groups = [
        {
            id: ActionGroupId.OSX,
            name: t(`app.governance.actionComposer.group.${ActionGroupId.OSX}`),
            info: addressUtils.truncateAddress(dao?.address),
            indexData: [dao!.address],
        },
        ...pluginGroups,
    ];

    const items = [
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
        ...pluginItems,
    ];

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
