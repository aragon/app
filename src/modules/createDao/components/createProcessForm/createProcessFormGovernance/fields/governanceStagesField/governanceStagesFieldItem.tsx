import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Button, Card, Dropdown, IconType, InputText } from '@aragon/gov-ui-kit';
import type React from 'react';
import { useWatch } from 'react-hook-form';
import { type ICreateProcessFormStage, ProcessStageType } from '../../../createProcessFormDefinitions';
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
     * Current number of stages.
     */
    stagesCount: number;
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

export const GovernanceStagesFieldItem: React.FC<IGovernanceStagesFieldItemProps> = (props) => {
    const { formPrefix, daoId, stagesCount, onDelete, index, readOnly = false } = props;

    const { t } = useTranslations();

    useFormField<Record<string, ICreateProcessFormStage>, typeof formPrefix>(formPrefix);

    const stageType = useWatch<Record<string, ICreateProcessFormStage['settings']['type']>>({
        name: `${formPrefix}.type`,
    });

    const isOptimisticStage = stageType === ProcessStageType.OPTIMISTIC;

    const stageNameField = useFormField<ICreateProcessFormStage, 'name'>('name', {
        label: t('app.createDao.createProcessForm.governance.stageField.name.label'),
        trimOnBlur: true,
        rules: { required: true, maxLength: nameMaxLength },
        fieldPrefix: formPrefix,
        defaultValue: '',
    });

    const bodiesLabelContext = isOptimisticStage ? 'veto' : 'normal';

    const stageNameText =
        stageNameField.value !== ''
            ? stageNameField.value
            : t('app.createDao.createProcessForm.governance.stageField.title');
    const stageNumberText = t('app.createDao.createProcessForm.governance.stageField.number', {
        stageNumber: index + 1,
    });

    return (
        <Card className="flex flex-col gap-y-10 border border-neutral-100 p-6">
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <p className="text-xl text-neutral-800">{stageNameText}</p>
                    <p className="text-neutral-400">{stageNumberText}</p>
                </div>
                {!readOnly && (
                    <InputText
                        helpText={t('app.createDao.createProcessForm.governance.stageField.name.helpText')}
                        maxLength={nameMaxLength}
                        {...stageNameField}
                    />
                )}
            </div>
            <GovernanceStageBodiesField
                formPrefix={formPrefix}
                daoId={daoId}
                labelContext={bodiesLabelContext}
                readOnly={readOnly}
            />
            <GovernanceStageSettingsField formPrefix={formPrefix} readOnly={readOnly} />
            {stagesCount > 1 && !readOnly && (
                <Dropdown.Container
                    constrainContentWidth={false}
                    size="md"
                    customTrigger={
                        <Button variant="tertiary" size="md" iconRight={IconType.DOTS_VERTICAL} className="self-end">
                            {t('app.createDao.createProcessForm.governance.stageField.action.more')}
                        </Button>
                    }
                >
                    <Dropdown.Item onClick={onDelete}>
                        {t('app.createDao.createProcessForm.governance.stageField.action.remove')}
                    </Dropdown.Item>
                </Dropdown.Container>
            )}
        </Card>
    );
};
