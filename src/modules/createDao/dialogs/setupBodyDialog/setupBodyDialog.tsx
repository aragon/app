import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import { invariant } from '@aragon/gov-ui-kit';
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
    const { onSubmit, initialValues } = location.params;

    const { t } = useTranslations();

    const [selectStep, metadataStep, membershipStep, governanceStep] = setupBodySteps;

    return (
        <WizardDialog.Container
            title={t('app.createDao.setupBodyDialog.title')}
            descriptionKey="app.createDao.setupBodyDialog.a11y.description"
            formId="bodySetup"
            onSubmit={onSubmit}
            initialSteps={setupBodySteps}
            defaultValues={initialValues}
            submitLabel={t('app.createDao.setupBodyDialog.submit')}
        >
            <WizardDialog.Step {...selectStep}>
                <SetupBodyDialogSelect />
            </WizardDialog.Step>
            <WizardDialog.Step {...metadataStep}>
                <SetupBodyDialogMetadata />
            </WizardDialog.Step>
            <WizardDialog.Step {...membershipStep}>
                <SetupBodyDialogMemberhip />
            </WizardDialog.Step>
            <WizardDialog.Step {...governanceStep}>
                <SetupBodyDialogGovernance />
            </WizardDialog.Step>
        </WizardDialog.Container>
    );
};
