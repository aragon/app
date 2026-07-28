import {
    Button,
    Card,
    Dropdown,
    IconType,
    InputText,
} from '@aragon/gov-ui-kit';
import type React from 'react';
import { useWatch } from 'react-hook-form';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { ICreateProcessFormStage } from '../../../createProcessFormDefinitions';
import { GovernanceStageBodiesField } from '../governanceStageBodiesField';
import { GovernanceStageSettingsField } from '../governanceStageSettingsField';

export interface IGovernanceStagesFieldItemProps {
    /**
     * Prefix to be prepended to all form fields.
     */
    formPrefix: string;
    /**
     * ID of the DAO to setup the stage for.
     */
    daoId: string;
    /**
     * Callback called on delete button click.
     */
    onDelete: () => void;
    /**
     * Index of the stage in the stages array.
     */
    index: number;
    /**
     * If the component field is read-only.
     * @default false
     */
    readOnly?: boolean;
}

const nameMaxLength = 40;

export const GovernanceStagesFieldItem: React.FC<
    IGovernanceStagesFieldItemProps
> = (props) => {
    const { formPrefix, daoId, onDelete, index, readOnly = false } = props;

    const { t } = useTranslations();

    useFormField<Record<string, ICreateProcessFormStage>, typeof formPrefix>(
        formPrefix,
    );

    // No defaultValue on purpose: with one set, useWatch returns it instead of the
    // form values until the first subscription update, which never comes on
    // read-only pages (e.g. process details) where the form is never touched.
    const bodies =
        useWatch<Record<string, ICreateProcessFormStage['bodies']>>({
            name: `${formPrefix}.bodies`,
        }) ?? [];

    // Only a stage whose bodies are all vetoing is labelled as a veto stage;
    // approve-only and mixed stages use the default label.
    const isVetoStage =
        bodies.length > 0 &&
        bodies.every((body) => body.proposalType === SppProposalType.VETO);

    const stageNameField = useFormField<ICreateProcessFormStage, 'name'>(
        'name',
        {
            label: t(
                'app.createDao.createProcessForm.governance.stageField.name.label',
            ),
            trimOnBlur: true,
            rules: { required: true, maxLength: nameMaxLength },
            fieldPrefix: formPrefix,
            defaultValue: '',
        },
    );

    const bodiesLabelContext = isVetoStage ? 'veto' : 'normal';

    const stageNameText =
        stageNameField.value !== ''
            ? stageNameField.value
            : t('app.createDao.createProcessForm.governance.stageField.title');
    const stageNumberText = t(
        'app.createDao.createProcessForm.governance.stageField.number',
        {
            stageNumber: index + 1,
        },
    );

    return (
        <Card className="flex flex-col gap-y-10 border border-neutral-100 p-6">
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <p className="text-neutral-800 text-xl">{stageNameText}</p>
                    <p className="text-neutral-400">{stageNumberText}</p>
                </div>
                {!readOnly && (
                    <InputText
                        helpText={t(
                            'app.createDao.createProcessForm.governance.stageField.name.helpText',
                        )}
                        maxLength={nameMaxLength}
                        {...stageNameField}
                    />
                )}
            </div>
            <GovernanceStageBodiesField
                daoId={daoId}
                formPrefix={formPrefix}
                labelContext={bodiesLabelContext}
                readOnly={readOnly}
            />
            <GovernanceStageSettingsField
                formPrefix={formPrefix}
                readOnly={readOnly}
            />
            {!readOnly && (
                <Dropdown.Container
                    constrainContentWidth={false}
                    customTrigger={
                        <Button
                            className="self-end"
                            iconRight={IconType.DOTS_VERTICAL}
                            size="md"
                            variant="tertiary"
                        >
                            {t(
                                'app.createDao.createProcessForm.governance.stageField.action.more',
                            )}
                        </Button>
                    }
                    size="md"
                >
                    <Dropdown.Item onClick={onDelete}>
                        {t(
                            'app.createDao.createProcessForm.governance.stageField.action.remove',
                        )}
                    </Dropdown.Item>
                </Dropdown.Container>
            )}
        </Card>
    );
};
