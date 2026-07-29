import {
    Button,
    DefinitionList,
    InputContainer,
    Tag,
} from '@aragon/gov-ui-kit';
import { Duration } from 'luxon';
import { useFormContext, useWatch } from 'react-hook-form';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import type {
    ISetupStageSettingsDialogParams,
    ISetupStageSettingsForm,
} from '@/modules/createDao/dialogs/setupStageSettingsDialog';
import { useDialogContext } from '@/shared/components/dialogProvider/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IDateDuration } from '@/shared/utils/dateUtils';
import type { ICreateProcessFormStage } from '../../../createProcessFormDefinitions';
import { createProcessFormUtils } from '../../../createProcessFormUtils';

export interface IGovernanceStageSettingsFieldProps {
    /**
     * Prefix to be prepended to the form field.
     */
    formPrefix: string;
    /**
     * If the component field is read-only.
     * @default false
     */
    readOnly?: boolean;
}

const formatDuration = (duration: IDateDuration): string => {
    const parsedDuration = Object.fromEntries(
        Object.entries(duration).filter(([, value]) => value !== 0),
    );

    if (Object.keys(parsedDuration).length === 0) {
        parsedDuration.minutes = 0;
    }

    return Duration.fromObject(parsedDuration).toHuman();
};

export const GovernanceStageSettingsField: React.FC<
    IGovernanceStageSettingsFieldProps
> = (props) => {
    const { formPrefix, readOnly = false } = props;

    const fieldPrefix = `${formPrefix}.settings`;

    const { t } = useTranslations();
    const { setValue } = useFormContext();
    const { open } = useDialogContext();

    // No defaultValue on purpose: with one set, useWatch returns it instead of the
    // form values until the first subscription update, which never comes on
    // read-only pages (e.g. process details) where the form is never touched.
    const bodies =
        useWatch<Record<string, ICreateProcessFormStage['bodies']>>({
            name: `${formPrefix}.bodies`,
        }) ?? [];

    const { value: votingPeriod } = useFormField<
        ISetupStageSettingsForm,
        'votingPeriod'
    >('votingPeriod', {
        fieldPrefix,
    });

    const { value: earlyStageAdvance } = useFormField<
        ISetupStageSettingsForm,
        'earlyStageAdvance'
    >('earlyStageAdvance', { fieldPrefix });

    const { value: stageExpiration } = useFormField<
        ISetupStageSettingsForm,
        'stageExpiration'
    >('stageExpiration', {
        fieldPrefix,
    });

    const { value: approvalThreshold } = useFormField<
        ISetupStageSettingsForm,
        'approvalThreshold'
    >('approvalThreshold', {
        fieldPrefix,
    });

    const { value: vetoThreshold } = useFormField<
        ISetupStageSettingsForm,
        'vetoThreshold'
    >('vetoThreshold', {
        fieldPrefix,
    });

    // Approve/veto is a per-body property, so a stage may have approving bodies,
    // vetoing bodies, or both (mixed). The summary and the settings dialog adapt
    // to the actual body composition. The thresholds themselves are displayed on
    // the bodies they apply to, not in the stage settings summary.
    const {
        approvingBodyCount,
        vetoingBodyCount,
        approvalThreshold: effectiveApprovalThreshold,
        vetoThreshold: effectiveVetoThreshold,
    } = createProcessFormUtils.getEffectiveStageThresholds({
        settings: { approvalThreshold, vetoThreshold },
        bodies,
    });

    const earlyStageTagValue = earlyStageAdvance ? 'yes' : 'no';
    const earlyStageTagLabel = t(
        `app.createDao.createProcessForm.governance.stageSettingsField.${earlyStageTagValue}`,
    );

    const expirationTagValue = stageExpiration != null ? 'yes' : 'no';
    const expirationTagLabel = t(
        `app.createDao.createProcessForm.governance.stageSettingsField.${expirationTagValue}`,
    );

    const handleDialogSubmit = (values: ISetupStageSettingsForm) => {
        setValue(`${fieldPrefix}.votingPeriod`, values.votingPeriod);
        setValue(`${fieldPrefix}.earlyStageAdvance`, values.earlyStageAdvance);
        setValue(`${fieldPrefix}.stageExpiration`, values.stageExpiration);
        setValue(`${fieldPrefix}.approvalThreshold`, values.approvalThreshold);
        setValue(`${fieldPrefix}.vetoThreshold`, values.vetoThreshold);
    };

    const handleSettingsDialogOpen = () => {
        const params: ISetupStageSettingsDialogParams = {
            onSubmit: handleDialogSubmit,
            defaultValues: {
                votingPeriod,
                earlyStageAdvance,
                stageExpiration,
                approvalThreshold: effectiveApprovalThreshold,
                vetoThreshold: effectiveVetoThreshold,
            },
            approvingBodyCount,
            vetoingBodyCount,
        };
        open(CreateDaoDialogId.SETUP_STAGE_SETTINGS, { params });
    };

    return (
        <InputContainer
            className="flex flex-col items-start gap-3"
            id="stageSettings"
            label={t(
                'app.createDao.createProcessForm.governance.stageSettingsField.label',
            )}
            useCustomWrapper={true}
        >
            <DefinitionList.Container className="rounded-xl border border-neutral-100 px-6 py-4">
                <DefinitionList.Item
                    term={t(
                        'app.createDao.createProcessForm.governance.stageSettingsField.votingPeriod',
                    )}
                >
                    {formatDuration(votingPeriod)}
                </DefinitionList.Item>
                {vetoingBodyCount === 0 && bodies.length > 0 && (
                    <DefinitionList.Item
                        term={t(
                            'app.createDao.createProcessForm.governance.stageSettingsField.earlyAdvance',
                        )}
                    >
                        <Tag
                            className="w-fit"
                            label={earlyStageTagLabel}
                            variant={earlyStageAdvance ? 'primary' : 'neutral'}
                        />
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item
                    term={t(
                        'app.createDao.createProcessForm.governance.stageSettingsField.expiration',
                    )}
                >
                    <Tag
                        className="w-fit"
                        label={expirationTagLabel}
                        variant={
                            stageExpiration != null ? 'primary' : 'neutral'
                        }
                    />
                </DefinitionList.Item>
                {stageExpiration != null && (
                    <DefinitionList.Item
                        term={t(
                            'app.createDao.createProcessForm.governance.stageSettingsField.expirationPeriod',
                        )}
                    >
                        {formatDuration(stageExpiration)}
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
            {!readOnly && (
                <Button
                    onClick={handleSettingsDialogOpen}
                    size="md"
                    variant="tertiary"
                >
                    {t(
                        'app.createDao.createProcessForm.governance.stageSettingsField.edit',
                    )}
                </Button>
            )}
        </InputContainer>
    );
};
