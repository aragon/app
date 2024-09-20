import { type IProposalAction, ProposalActionType } from '@/modules/governance/api/governanceService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType, ProposalActions } from '@aragon/ods';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { ActionComposer } from '../../actionComposer';
import type { ICreateProposalFormData } from '../createProposalFormDefinitions';
import { TransferAssetAction } from './proposalActions/transferAssetAction';
import { UpdateDaoMetadataAction } from './proposalActions/updateDaoMetadataAction';

export interface ICreateProposalFormActionsProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

const customActionComponents = {
    [ProposalActionType.TRANSFER]: TransferAssetAction,
    [ProposalActionType.METADATA_UPDATE]: UpdateDaoMetadataAction,
};

export const CreateProposalFormActions: React.FC<ICreateProposalFormActionsProps> = (props) => {
    const { daoId } = props;

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

    const handleAddAction = () => autocompleteInputRef.current?.focus();

    const handleItemSelected = (action: IProposalAction) => addAction({ ...action, daoId });

    const handleMoveAction = (index: number, newIndex: number) => {
        if (newIndex >= 0 && newIndex < actions.length) {
            moveAction(index, newIndex);
        }
    };

    return (
        <div className="flex flex-col gap-y-10">
            <ProposalActions
                actions={actions}
                actionKey="id"
                customActionComponents={customActionComponents}
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
                daoId={daoId}
            />
        </div>
    );
};
