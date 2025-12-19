import { InputContainer, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { BodyType } from '../../../types/enum';
import {
    GovernanceType,
    type ICreateProcessFormData,
    ProposalCreationMode,
} from '../createProcessFormDefinitions';
import { ProposalCreationSettingsDefault } from './proposalCreationSettingsDefault';

export interface ICreateProcessFormProposalCreationProps {}

export const CreateProcessFormProposalCreation: React.FC<
    ICreateProcessFormProposalCreationProps
> = () => {
    const { t } = useTranslations();
    const { trigger } = useFormContext();

    const governanceType = useWatch<ICreateProcessFormData, 'governanceType'>({
        name: 'governanceType',
    });
    const isAdvancedGovernance = governanceType === GovernanceType.ADVANCED;

    const basicProcessBody = useWatch<ICreateProcessFormData, 'body'>({
        name: 'body',
    });
    const stages = useWatch<ICreateProcessFormData, 'stages'>({
        name: 'stages',
    });

    const getBodyFormPrefix = (bodyIndex: number, stageIndex?: number) =>
        stageIndex != null
            ? `stages.${stageIndex.toString()}.bodies.${bodyIndex.toString()}`
            : 'body';

    const processBodies = useMemo(() => {
        // Keep the original bodyIndex since EXTERNAL bodies are filtered out
        const processedBodies = isAdvancedGovernance
            ? stages.flatMap((stage, stageIndex) =>
                  stage.bodies.map((body, bodyIndex) => ({
                      ...body,
                      stageIndex,
                      bodyIndex,
                  })),
              )
            : [{ ...basicProcessBody, stageIndex: undefined, bodyIndex: 0 }];

        return processedBodies.filter(
            (body) => body.type !== BodyType.EXTERNAL || body.isSafe,
        );
    }, [isAdvancedGovernance, stages, basicProcessBody]);

    const canBodiesCreateProposals = processBodies.some(
        (body) => body.canCreateProposal,
    );
    const createProposalsError =
        'app.createDao.createProcessForm.proposalCreation.bodies.error';

    const { ANY_WALLET, LISTED_BODIES } = ProposalCreationMode;

    const {
        onChange: onModeChange,
        value: mode,
        alert: permissionsAlert,
        ...modeField
    } = useFormField<ICreateProcessFormData, 'proposalCreationMode'>(
        'proposalCreationMode',
        {
            label: t(
                'app.createDao.createProcessForm.proposalCreation.mode.label',
            ),
            rules: {
                validate: (value) =>
                    value !== ANY_WALLET && !canBodiesCreateProposals
                        ? createProposalsError
                        : undefined,
            },
            defaultValue: LISTED_BODIES,
        },
    );

    // Trigger proposalCreationMode validation on allowed bodies selection change
    useEffect(() => {
        void trigger('proposalCreationMode');
    }, [trigger]);

    return (
        <>
            <RadioGroup
                className="md:!flex-row flex gap-4"
                onValueChange={onModeChange}
                value={mode}
                {...modeField}
            >
                <RadioCard
                    className="min-w-0"
                    description={t(
                        'app.createDao.createProcessForm.proposalCreation.mode.bodiesDescription',
                    )}
                    label={t(
                        'app.createDao.createProcessForm.proposalCreation.mode.bodiesLabel',
                    )}
                    value={LISTED_BODIES}
                />
                <RadioCard
                    className="min-w-0"
                    description={t(
                        'app.createDao.createProcessForm.proposalCreation.mode.anyDescription',
                    )}
                    label={t(
                        'app.createDao.createProcessForm.proposalCreation.mode.anyLabel',
                    )}
                    value={ANY_WALLET}
                />
            </RadioGroup>
            <InputContainer
                alert={permissionsAlert}
                className={mode === ANY_WALLET ? 'hidden' : ''}
                id="proposalCreationBodies"
                label={t(
                    'app.createDao.createProcessForm.proposalCreation.bodies.label',
                )}
                useCustomWrapper={true}
            >
                {processBodies.map((body) => (
                    <PluginSingleComponent
                        body={body}
                        disableCheckbox={processBodies.length === 1}
                        Fallback={ProposalCreationSettingsDefault}
                        formPrefix={getBodyFormPrefix(
                            body.bodyIndex,
                            body.stageIndex,
                        )}
                        key={body.internalId}
                        mode={mode}
                        pluginId={body.plugin}
                        slotId={
                            CreateDaoSlotId.CREATE_DAO_PROPOSAL_CREATION_SETTINGS
                        }
                    />
                ))}
            </InputContainer>
        </>
    );
};
