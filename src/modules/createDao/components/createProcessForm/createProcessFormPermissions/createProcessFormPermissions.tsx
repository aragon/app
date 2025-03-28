import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputContainer, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import { ProposalCreationMode, type ICreateProcessFormData } from '../createProcessFormDefinitions';

export interface ICreateProcessFormPermissionProps {}

const validateProposalCreationBodies = (bodies: ICreateProcessFormData['bodies']) => {
    const canBodiesCreateProposals = bodies.some((body) => body.canCreateProposal);

    return canBodiesCreateProposals || 'app.createDao.createProcessForm.permissions.proposalCreation.bodies.error';
};

export const CreateProcessFormPermissions: React.FC<ICreateProcessFormPermissionProps> = () => {
    const { t } = useTranslations();

    const processBodies = useWatch<ICreateProcessFormData, 'bodies'>({ name: 'bodies' });

    const {
        onChange: onModeChange,
        value: mode,
        ...modeField
    } = useFormField<ICreateProcessFormData, 'proposalCreationMode'>('proposalCreationMode', {
        label: t('app.createDao.createProcessForm.permissions.proposalCreation.mode.label'),
        rules: { validate: () => validateProposalCreationBodies(processBodies) },
    });

    return (
        <>
            <RadioGroup className="flex gap-4 md:!flex-row" onValueChange={onModeChange} value={mode} {...modeField}>
                <RadioCard
                    className="min-w-0"
                    label={t('app.createDao.createProcessForm.permissions.proposalCreation.mode.bodiesLabel')}
                    description={t(
                        'app.createDao.createProcessForm.permissions.proposalCreation.mode.bodiesDescription',
                    )}
                    value={ProposalCreationMode.LISTED_BODIES}
                />
                <RadioCard
                    className="min-w-0"
                    label={t('app.createDao.createProcessForm.permissions.proposalCreation.mode.anyLabel')}
                    description={t('app.createDao.createProcessForm.permissions.proposalCreation.mode.anyDescription')}
                    value={ProposalCreationMode.ANY_WALLET}
                />
            </RadioGroup>
            <InputContainer
                id="proposalCreationBodies"
                label={t('app.createDao.createProcessForm.permissions.proposalCreation.bodies.label')}
                useCustomWrapper={true}
                className={mode === ProposalCreationMode.ANY_WALLET ? 'hidden' : ''}
            >
                {processBodies.map((body, index) => (
                    <PluginSingleComponent
                        key={body.internalId}
                        pluginId={body.plugin}
                        slotId={CreateDaoSlotId.CREATE_DAO_PROPOSAL_CREATION_SETTINGS}
                        body={body}
                        formPrefix={`bodies.${index.toString()}`}
                        mode={mode}
                    />
                ))}
            </InputContainer>
        </>
    );
};
