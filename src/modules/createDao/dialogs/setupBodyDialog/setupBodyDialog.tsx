import { addressUtils, invariant } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { daoProcessDetailsClientUtils } from '@/modules/settings/pages/daoProcessDetailsPage';
import { useDao } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import { BodyType } from '../../types/enum';
import type { ISetupBodyForm } from './setupBodyDialogDefinitions';
import {
    type ISetupBodyDialogStepsProps,
    SetupBodyDialogSteps,
} from './setupBodyDialogSteps';

export interface ISetupBodyDialogParams extends ISetupBodyDialogStepsProps {
    /**
     * Callback called on submit.
     */
    onSubmit: (values: ISetupBodyForm) => void;
}

export interface ISetupBodyDialogProps
    extends IDialogComponentProps<ISetupBodyDialogParams> {}

export const SetupBodyDialog: React.FC<ISetupBodyDialogProps> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'SetupBodyDialog: required parameters must be set.',
    );
    const { onSubmit, initialValues, isSubPlugin, daoId } = location.params;

    const { t } = useTranslations();
    const { address } = useAccount();

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const processedInitialValues = useMemo(() => {
        if (
            initialValues?.type === BodyType.EXTERNAL ||
            initialValues?.membership.members.length
        ) {
            return initialValues;
        }

        return {
            ...initialValues,
            membership: {
                ...initialValues?.membership,
                members: [{ address }],
            },
        };
    }, [initialValues, address]);

    const handleSubmit = (values: ISetupBodyForm) => {
        if (values.type === BodyType.EXTERNAL) {
            const existingPlugin = dao?.plugins.find((plugin) =>
                addressUtils.isAddressEqual(plugin.address, values.address),
            );

            const processedValues = existingPlugin
                ? daoProcessDetailsClientUtils.bodyToFormData({
                      plugin: existingPlugin,
                      membership: { members: [] },
                  })
                : values;

            onSubmit(processedValues);
        } else {
            onSubmit(values);
        }
    };

    return (
        <WizardDialog.Container
            defaultValues={processedInitialValues}
            formId="bodySetup"
            onSubmit={handleSubmit}
            submitLabel={t('app.createDao.setupBodyDialog.submit')}
            title={t('app.createDao.setupBodyDialog.title')}
        >
            <SetupBodyDialogSteps
                daoId={daoId}
                initialValues={initialValues}
                isSubPlugin={isSubPlugin}
            />
        </WizardDialog.Container>
    );
};
