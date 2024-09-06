import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, CardEmptyState, IconType, ProposalActions } from '@aragon/ods';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { ActionComposer } from '../../actionComposer';
import { type ICreateProposalFormData } from '../createProposalFormDefinitions';
import { UpdateDaoMetadataAction } from './proposalActions/updateDaoMetadataAction';

export interface ICreateProposalFormActionsProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const CreateProposalFormActions: React.FC<ICreateProposalFormActionsProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();

    const autocompleteInputRef = useRef<HTMLInputElement | null>(null);
    const [displayActionComposer, setDisplayActionComposer] = useState(false);

    const { fields: actions, append: addAction } = useFieldArray<ICreateProposalFormData, 'actions'>({
        name: 'actions',
    });

    const customActionComponents = {
        [ProposalActionType.TRANSFER]: () => <div>Transfer Assets</div>,
        [ProposalActionType.METADATA_UPDATE]: UpdateDaoMetadataAction,
    };

    const handleAddAction = () => autocompleteInputRef.current?.focus();

    const handleItemSelected = (actionType: string) => {
        addAction({ type: actionType, from: '', to: '', data: '', value: '0', inputData: null, index: actions.length });
    };

    // TODO:
    // 1 - Accordion Item headers on action add as set as unverified
    // 2 - Transaction building on fields change

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
                // @ts-expect-error TODO type issue on customActionComponents
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
                onChange={handleItemSelected}
                onOpenChange={setDisplayActionComposer}
                ref={autocompleteInputRef}
                daoId={daoId}
            />
        </div>
    );
};
