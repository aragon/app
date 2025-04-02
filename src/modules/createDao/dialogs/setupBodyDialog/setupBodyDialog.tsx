import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import { invariant } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import type { ISetupBodyForm } from './setupBodyDialogDefinitions';
import { SetupBodyDialogGovernance } from './setupBodyDialogGovernance';
import { SetupBodyDialogMemberhip } from './setupBodyDialogMembership';
import { SetupBodyDialogMetadata } from './setupBodyDialogMetadata';
import { SetupBodyDialogSelect } from './setupBodyDialogSelect';

export interface ISetupBodyDialogParams {
    /**
     * Callback called on submit.
     */
    onSubmit: (values: ISetupBodyForm) => void;
    /**
     * Initial values for the form.
     */
    initialValues?: ISetupBodyForm;
    /**
     * Defines if the body is being added to the governance process as a sub-plugin or not.
     */
    isSubPlugin?: boolean;
    /**
     * ID of the DAO to fetch the members from.
     */
    daoId: string;
}

export interface ISetupBodyDialogProps extends IDialogComponentProps<ISetupBodyDialogParams> {}

const setupBodySteps = [
    { id: 'select', order: 1, meta: { name: '' } },
    { id: 'metadata', order: 2, meta: { name: '' } },
    { id: 'membership', order: 3, meta: { name: '' } },
    { id: 'governance', order: 4, meta: { name: '' } },
];

export const SetupBodyDialog: React.FC<ISetupBodyDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'SetupBodyDialog: required parameters must be set.');
    const { onSubmit, initialValues, isSubPlugin, daoId } = location.params;

    const { t } = useTranslations();
    const { address } = useAccount();

    const processedInitialValues = useMemo(() => {
        if (initialValues?.membership.members.length) {
            return initialValues;
        }

        return { ...initialValues, membership: { ...initialValues?.membership, members: [{ address }] } };
    }, [initialValues, address]);

    const [selectStep, metadataStep, membershipStep, governanceStep] = setupBodySteps;
    const initialSteps = setupBodySteps.filter(
        (step) => (initialValues == null || step.id !== 'select') && (isSubPlugin === true || step.id !== 'metadata'),
    );

    return (
        <WizardDialog.Container
            title={t('app.createDao.setupBodyDialog.title')}
            formId="bodySetup"
            onSubmit={onSubmit}
            defaultValues={processedInitialValues}
            initialSteps={initialSteps}
            submitLabel={t('app.createDao.setupBodyDialog.submit')}
        >
            {initialValues == null && (
                <WizardDialog.Step {...selectStep}>
                    <SetupBodyDialogSelect />
                </WizardDialog.Step>
            )}
            {isSubPlugin && (
                <WizardDialog.Step {...metadataStep}>
                    <SetupBodyDialogMetadata />
                </WizardDialog.Step>
            )}
            <WizardDialog.Step {...membershipStep}>
                <SetupBodyDialogMemberhip daoId={daoId} />
            </WizardDialog.Step>
            <WizardDialog.Step {...governanceStep}>
                <SetupBodyDialogGovernance isSubPlugin={isSubPlugin} />
            </WizardDialog.Step>
        </WizardDialog.Container>
    );
};
