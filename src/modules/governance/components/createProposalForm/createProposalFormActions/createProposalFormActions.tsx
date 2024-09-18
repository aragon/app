import { type IProposalAction, ProposalActionType } from '@/modules/governance/api/governanceService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, CardEmptyState, IconType, type ProposalActionComponent, ProposalActions } from '@aragon/ods';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { ActionComposer } from '../../actionComposer';
import { type ICreateProposalFormData } from '../createProposalFormDefinitions';
import { TransferAssetAction } from './proposalActions/transferAssetAction';
import { UpdateDaoMetadataAction } from './proposalActions/updateDaoMetadataAction';

export interface ICreateProposalFormActionsProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

const customActionComponents = {
    [ProposalActionType.TRANSFER]: TransferAssetAction as ProposalActionComponent,
    [ProposalActionType.METADATA_UPDATE]: UpdateDaoMetadataAction as ProposalActionComponent,
};

export const CreateProposalFormActions: React.FC<ICreateProposalFormActionsProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();

    const autocompleteInputRef = useRef<HTMLInputElement | null>(null);
    const [displayActionComposer, setDisplayActionComposer] = useState(false);

    const { append: addAction } = useFieldArray<ICreateProposalFormData, 'actions'>({ name: 'actions' });
    const actions = useWatch<ICreateProposalFormData, 'actions'>({ name: 'actions' });

    const handleAddAction = () => autocompleteInputRef.current?.focus();

    const handleItemSelected = (action: IProposalAction) => addAction({ ...action, index: actions.length, daoId });

    return (
        <div className="flex flex-col gap-y-10">
            {actions.length === 0 && (
                <CardEmptyState
                    heading={t('app.governance.createProposalForm.actions.empty.heading')}
                    description={t('app.governance.createProposalForm.actions.empty.description')}
                    objectIllustration={{ object: 'SMART_CONTRACT' }}
                    isStacked={false}
                />
            )}
            {actions.length > 0 && (
                <ProposalActions actions={actions} customActionComponents={customActionComponents} />
            )}
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
