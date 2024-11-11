import { type IProposalAction, ProposalActionType } from '@/modules/governance/api/governanceService';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { Button, IconType, ProposalActions } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { ActionComposer, type IPluginActionComposerData } from '../../actionComposer';
import type { ICreateProposalFormData } from '../createProposalFormDefinitions';
import { TransferAssetAction } from './proposalActions/transferAssetAction';
import { UpdateDaoMetadataAction } from './proposalActions/updateDaoMetadataAction';

export interface ICreateProposalFormActionsProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

const coreCustomActionComponents = {
    [ProposalActionType.TRANSFER]: TransferAssetAction,
    [ProposalActionType.METADATA_UPDATE]: UpdateDaoMetadataAction,
};

export const CreateProposalFormActions: React.FC<ICreateProposalFormActionsProps> = (props) => {
    const { daoId } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const { t } = useTranslations();

    const autocompleteInputRef = useRef<HTMLInputElement | null>(null);

    const [displayActionComposer, setDisplayActionComposer] = useState(false);

    const {
        append: addAction,
        remove: removeAction,
        move: moveAction,
        fields: actions,
    } = useFieldArray<ICreateProposalFormData, 'actions'>({
        name: 'actions',
    });

    // Needed to control the entire field array (see Controlled Field Array on useFieldArray)
    const watchFieldArray = useWatch({ name: 'actions' });
    const controlledActions = actions.map((field, index) => ({ ...field, ...watchFieldArray[index] }));

    const handleAddAction = () => autocompleteInputRef.current?.focus();

    const handleItemSelected = (action: IProposalAction) => addAction({ ...action, daoId });

    const handleMoveAction = (index: number, newIndex: number) => {
        if (newIndex >= 0 && newIndex < actions.length) {
            moveAction(index, newIndex);
        }
    };

    const pluginActions =
        dao?.plugins?.map((plugin) =>
            pluginRegistryUtils.getSlotFunction<IDaoPlugin, IPluginActionComposerData>({
                pluginId: plugin.subdomain,
                slotId: GovernanceSlotId.GOVERNANCE_PLUGIN_ACTIONS,
            })?.(plugin),
        ) ?? [];

    const pluginItems = pluginActions.flatMap((data) => data?.items ?? []);
    const pluginGroups = pluginActions.flatMap((data) => data?.groups ?? []);
    const pluginComponents = pluginActions.reduce((acc, data) => ({ ...acc, ...data?.components }), {});

    const allCustomActionComponents = { ...coreCustomActionComponents, ...pluginComponents };

    return (
        <div className="flex flex-col gap-y-10">
            <ProposalActions
                actions={controlledActions}
                actionKey="id"
                customActionComponents={allCustomActionComponents}
                emptyStateDescription={t('app.governance.createProposalForm.actions.empty')}
                dropdownItems={[
                    {
                        label: t('app.governance.createProposalForm.actions.editAction.up'),
                        icon: IconType.CHEVRON_UP,
                        onClick: (_, index) => handleMoveAction(index, index - 1),
                    },
                    {
                        label: t('app.governance.createProposalForm.actions.editAction.down'),
                        icon: IconType.CHEVRON_DOWN,
                        onClick: (_, index) => handleMoveAction(index, index + 1),
                    },
                    {
                        label: t('app.governance.createProposalForm.actions.editAction.remove'),
                        icon: IconType.CLOSE,
                        onClick: (_, index) => removeAction(index),
                    },
                ]}
            />
            <Button
                variant="primary"
                size="md"
                iconLeft={IconType.PLUS}
                className={classNames('self-start', { 'sr-only': displayActionComposer })}
                onClick={handleAddAction}
            >
                {t('app.governance.createProposalForm.actions.action')}
            </Button>
            <ActionComposer
                wrapperClassName={classNames('transition-none', { '!sr-only': !displayActionComposer })}
                onActionSelected={handleItemSelected}
                onOpenChange={setDisplayActionComposer}
                ref={autocompleteInputRef}
                pluginItems={pluginItems}
                pluginGroups={pluginGroups}
                daoId={daoId}
            />
        </div>
    );
};
