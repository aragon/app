import { useDialogContext } from '@/shared/components/dialogProvider/dialogProvider';
import { ProcessStageType, type ICreateProcessFormStage } from '../../../createProcessFormDefinitions';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDateDuration } from '@/shared/utils/dateUtils';
import { Button, DefinitionList, InputContainer, Tag } from '@aragon/gov-ui-kit';
import { Duration } from 'luxon';
import { useWatch, useFormContext } from 'react-hook-form';
import type { ISetupStageSettingsDialogParams } from '@/modules/createDao/dialogs/setupStageSettingsDialog/setupStageSettingsDialog';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';


export interface IGovernanceStageSettingsFieldProps {
    /**
     * Prefix to be prepended to the form field.
     */
    fieldPrefix: string;
}

const requiredApprovalsDefaultValue = 1;

export const GovernanceStageSettingsField: React.FC<IGovernanceStageSettingsFieldProps> = (props) => {
    const { fieldPrefix } = props;

    const { t } = useTranslations();
        const { setValue } = useFormContext();
        const { open } = useDialogContext();

    const typeFieldName = `${fieldPrefix}.type`;
    const stageType = useWatch<Record<string, ICreateProcessFormStage['type']>>({
        name: typeFieldName,
    });

    const isOptimisticStage = stageType === ProcessStageType.OPTIMISTIC;
    const isTimelockStage = stageType === ProcessStageType.TIMELOCK;

    const approvalsFieldName = `${fieldPrefix}.requiredApprovals`;
    const approvals = useWatch<Record<string, ICreateProcessFormStage['requiredApprovals']>>({
        name: approvalsFieldName,
        defaultValue: requiredApprovalsDefaultValue,
    });

    const votingPeriodName = `${fieldPrefix}.timing.votingPeriod`;
    const votingPeriod = useWatch<Record<string, ICreateProcessFormStage['timing']['votingPeriod']>>({
        name: votingPeriodName,
        defaultValue: { days: 7, hours: 0, minutes: 0 },
    });

    const earlyStageAdvanceName = `${fieldPrefix}.timing.earlyStageAdvance`;
    const earlyStageAdvance = useWatch<Record<string, ICreateProcessFormStage['timing']['earlyStageAdvance']>>({
        name: earlyStageAdvanceName,
    });

    const stageExpirationName = `${fieldPrefix}.timing.stageExpiration`;
    const stageExpiration = useWatch<Record<string, ICreateProcessFormStage['timing']['stageExpiration']>>({
        name: stageExpirationName,
    });

        const handleDialogSubmit = (values: ICreateProcessFormStage) => {
            const { timing, requiredApprovals, type} = values;
            const { votingPeriod, earlyStageAdvance, stageExpiration } = timing;
            setValue(votingPeriodName, votingPeriod);
            setValue(earlyStageAdvanceName, earlyStageAdvance);
            setValue(stageExpirationName, stageExpiration);
            setValue(approvalsFieldName, requiredApprovals);
            setValue(typeFieldName, type);
        };

    const formatDuration = (duration?: IDateDuration): string => {
        const parsedDuration = Object.fromEntries(
            Object.entries(duration ?? { days: 7, hours: 0, minutes: 0 }).filter(([, value]) => value !== 0),
        );

        if (Object.keys(parsedDuration).length === 0) {
            parsedDuration.minutes = 0;
        }

        return Duration.fromObject(parsedDuration).toHuman();
    };

    const votingPeriodLabel = isTimelockStage
        ? t('app.createDao.createProcessForm.governance.stageSettingsField.timelockPeriod')
        : t('app.createDao.createProcessForm.governance.stageSettingsField.votingPeriod');

    const earlyStageTagValue = earlyStageAdvance ? 'yes' : 'no';
    const earlyStageTagLabel = t(`app.createDao.createProcessForm.governance.stageSettingsField.${earlyStageTagValue}`);

    const expirationTagValue = stageExpiration != null ? 'yes' : 'no';
    const expirationTagLabel = t(`app.createDao.createProcessForm.governance.stageSettingsField.${expirationTagValue}`);

        const handleSettingsDialogOpen = () => {
            const params: ISetupStageSettingsDialogParams = {
                fieldPrefix,
                onSubmit: handleDialogSubmit,
                stageType,
                defaultValues: { type: stageType, timing: { votingPeriod, earlyStageAdvance, stageExpiration }, requiredApprovals: approvals },
            };
            open(CreateDaoDialogId.SETUP_STAGE_SETTINGS, { params });
        };

    return (
        <InputContainer
            useCustomWrapper={true}
            id="stageSettings"
            label={t('app.createDao.createProcessForm.governance.stageSettingsField.label')}
            className="flex flex-col items-start gap-3"
        >
            <DefinitionList.Container className="rounded-xl border border-neutral-100 px-6 py-4">
                <DefinitionList.Item term="Governance type">
                    <p>{stageType}</p>
                </DefinitionList.Item>
                <DefinitionList.Item term="Approval threshold">
                    <p>{approvals}</p>
                </DefinitionList.Item>
                <DefinitionList.Item term={votingPeriodLabel}>{formatDuration(votingPeriod)}</DefinitionList.Item>
                {!isOptimisticStage && !isTimelockStage && (
                    <DefinitionList.Item
                        term={t('app.createDao.createProcessForm.governance.stageSettingsField.earlyAdvance')}
                    >
                        <Tag
                            className="w-fit"
                            label={earlyStageTagLabel}
                            variant={earlyStageAdvance ? 'primary' : 'neutral'}
                        />
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item
                    term={t('app.createDao.createProcessForm.governance.stageSettingsField.expiration')}
                >
                    <Tag
                        className="w-fit"
                        label={expirationTagLabel}
                        variant={stageExpiration != null ? 'primary' : 'neutral'}
                    />
                </DefinitionList.Item>
                {stageExpiration != null && (
                    <DefinitionList.Item
                        term={t('app.createDao.createProcessForm.governance.stageSettingsField.expirationPeriod')}
                    >
                        {formatDuration(stageExpiration)}
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
            <Button onClick={handleSettingsDialogOpen} variant="tertiary" size="md">
                {t('app.createDao.createProcessForm.governance.stageSettingsField.edit')}
            </Button>
        </InputContainer>
    );
};
