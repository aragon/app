import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputContainer, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import {
    ProposalCreationMode,
    type ICreateProcessFormData,
    type ICreateProcessFormPermissions,
} from '../createProcessFormDefinitions';
import { VotingBodyCheckboxCard } from './components/votingBodyCheckboxCard';

export interface ICreateProcessFormPermissionProps {}

const validateProposalCreationBodies =
    (proposalCreationMode: ProposalCreationMode) =>
    (bodies: ICreateProcessFormPermissions['proposalCreationBodies']) => {
        if (proposalCreationMode === ProposalCreationMode.ANY_WALLET) {
            return true;
        }

        return bodies.length > 0 || 'app.createDao.createProcessForm.permissions.votingBodies.error';
    };

export const CreateProcessFormPermissions: React.FC<ICreateProcessFormPermissionProps> = () => {
    const { t } = useTranslations();
    const { setValue, trigger } = useFormContext();

    // TODO: temporary workaround to prevent race condition of rendering the plugin-specific proposal creation form
    // fields (e.g. minProposerVotingPower) before the proposalCreationBodies array field is initialized (APP-3679)
    const [isInitialized, setIsInitialized] = useState(false);

    const processBodies = useWatch<ICreateProcessFormData, 'bodies'>({ name: 'bodies' });
    const defaultBodiesValue = useMemo(() => processBodies.map((body) => ({ bodyId: body.id })), [processBodies]);

    const {
        onChange: onProposalCreationModeChange,
        value: proposalCreationMode,
        ...proposalCreationModeField
    } = useFormField<ICreateProcessFormPermissions, 'proposalCreationMode'>('proposalCreationMode', {
        label: t('app.createDao.createProcessForm.permissions.proposalCreationMode.label'),
        fieldPrefix: 'permissions',
        defaultValue: ProposalCreationMode.LISTED_BODIES,
    });

    const proposalCreationBodiesName = 'permissions.proposalCreationBodies';
    const {
        fields: proposalCreationBodies,
        remove: removeProposalCreationBody,
        append: addProposalCreationBody,
    } = useFieldArray<ICreateProcessFormData, typeof proposalCreationBodiesName>({
        name: proposalCreationBodiesName,
        rules: { validate: validateProposalCreationBodies(proposalCreationMode) },
    });

    // Initialise proposalCreationBodies to all process bodies and update value on bodies list change
    useEffect(() => {
        setValue(proposalCreationBodiesName, defaultBodiesValue);
        setIsInitialized(true);
    }, [setValue, defaultBodiesValue]);

    const handleProposalCreationModeChange = (value: string) => {
        onProposalCreationModeChange(value);
        if (value === ProposalCreationMode.LISTED_BODIES) {
            setValue(proposalCreationBodiesName, defaultBodiesValue);
            void trigger(proposalCreationBodiesName);
        }
    };

    const handleBodyCheckboxChange = (bodyId: string, value: boolean) => {
        if (value) {
            addProposalCreationBody({ bodyId });
        } else {
            const checkedBodyIndex = proposalCreationBodies.findIndex((body) => body.bodyId === bodyId);
            removeProposalCreationBody(checkedBodyIndex);
        }
    };

    return (
        <>
            <RadioGroup
                className="flex gap-4 md:!flex-row"
                onValueChange={handleProposalCreationModeChange}
                value={proposalCreationMode}
                {...proposalCreationModeField}
            >
                <RadioCard
                    className="min-w-0"
                    label={t('app.createDao.createProcessForm.permissions.proposalCreationMode.bodiesLabel')}
                    description={t(
                        'app.createDao.createProcessForm.permissions.proposalCreationMode.bodiesDescription',
                    )}
                    value={ProposalCreationMode.LISTED_BODIES}
                />
                <RadioCard
                    className="min-w-0"
                    label={t('app.createDao.createProcessForm.permissions.proposalCreationMode.anyLabel')}
                    description={t('app.createDao.createProcessForm.permissions.proposalCreationMode.anyDescription')}
                    value={ProposalCreationMode.ANY_WALLET}
                />
            </RadioGroup>
            {isInitialized && proposalCreationMode === ProposalCreationMode.LISTED_BODIES && (
                <InputContainer
                    id="proposalCreationBodies"
                    label={t('app.createDao.createProcessForm.permissions.proposalCreationBodies.label')}
                    useCustomWrapper={true}
                >
                    {processBodies.map((body) => (
                        <VotingBodyCheckboxCard
                            key={body.id}
                            body={body}
                            onChange={handleBodyCheckboxChange}
                            checked={proposalCreationBodies.some(({ bodyId }) => body.id === bodyId)}
                            fieldPrefix={`${proposalCreationBodiesName}.${proposalCreationBodies.findIndex(({ bodyId }) => body.id === bodyId).toString()}`}
                        />
                    ))}
                </InputContainer>
            )}
        </>
    );
};
