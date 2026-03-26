import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import { useAdvancedGovernanceAvailability } from '@/modules/createDao/hooks/useAdvancedGovernanceAvailability';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    GovernanceType,
    type ICreateProcessFormData,
} from '../createProcessFormDefinitions';
import { GovernanceBasicBodyField } from './fields/governanceBasicBodyField';
import { GovernanceStagesField } from './fields/governanceStagesField';

export interface ICreateProcessFormGovernanceProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Callback to signal whether the Next button should be disabled.
     */
    onDisableNextChange?: (disabled: boolean) => void;
}

export const CreateProcessFormGovernance: React.FC<
    ICreateProcessFormGovernanceProps
> = (props) => {
    const { daoId, onDisableNextChange } = props;

    const { t } = useTranslations();
    const { setValue } = useFormContext();

    const { isAvailable: isAdvancedAvailable } =
        useAdvancedGovernanceAvailability({ daoId });

    const {
        value: governanceType,
        onChange: onGovernanceTypeChange,
        ...governanceTypeField
    } = useFormField<ICreateProcessFormData, 'governanceType'>(
        'governanceType',
        {
            label: t('app.createDao.createProcessForm.governance.type.label'),
            defaultValue: GovernanceType.BASIC,
            rules: { required: true },
        },
    );

    const handleGovernanceTypeChange = (value: string) => {
        if (value === GovernanceType.ADVANCED) {
            setValue('body', undefined);
            setValue('stages', []);
            onDisableNextChange?.(!isAdvancedAvailable);
        } else {
            setValue('stages', []);
            onDisableNextChange?.(false);
        }

        onGovernanceTypeChange(value);
    };

    const isAdvancedGovernance = governanceType === GovernanceType.ADVANCED;

    const advancedTag = isAdvancedAvailable
        ? undefined
        : {
              label: t(
                  'app.createDao.createProcessForm.governance.advancedEmptyState.tag',
              ),
              variant: 'neutral' as const,
          };

    return (
        <div className="flex w-full flex-col gap-10">
            <RadioGroup
                className="w-full gap-4 md:flex-row"
                helpText={t(
                    'app.createDao.createProcessForm.governance.type.helpText',
                )}
                onValueChange={handleGovernanceTypeChange}
                value={governanceType}
                {...governanceTypeField}
            >
                <RadioCard
                    description={t(
                        'app.createDao.createProcessForm.governance.type.BASIC.description',
                    )}
                    label={t(
                        'app.createDao.createProcessForm.governance.type.BASIC.label',
                    )}
                    value={GovernanceType.BASIC}
                />
                <RadioCard
                    description={t(
                        'app.createDao.createProcessForm.governance.type.ADVANCED.description',
                    )}
                    label={t(
                        'app.createDao.createProcessForm.governance.type.ADVANCED.label',
                    )}
                    tag={advancedTag}
                    value={GovernanceType.ADVANCED}
                />
            </RadioGroup>
            {!isAdvancedGovernance && (
                <GovernanceBasicBodyField daoId={daoId} />
            )}
            {isAdvancedGovernance && (
                <GovernanceStagesField
                    daoId={daoId}
                    isAdvancedAvailable={isAdvancedAvailable}
                />
            )}
        </div>
    );
};
