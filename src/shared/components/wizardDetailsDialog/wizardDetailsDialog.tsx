import { Button, Dialog, Heading, IllustrationObject, invariant } from '@aragon/gov-ui-kit';
import { type IDialogComponentProps, useDialogContext } from '../dialogProvider';
import { useTranslations } from '../translationsProvider';
import type { IWizardDetailsDialogParams } from './wizardDetailsDialog.api';

export interface ICreateProcessInfoDialogProps extends IDialogComponentProps<IWizardDetailsDialogParams> {}

export const WizardDetailsDialog: React.FC<ICreateProcessInfoDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'WizardDetailsDialog: required parameters must be set.');

    const { t } = useTranslations();

    const { title, description, steps, primaryButton } = location.params;

    const { href, onPrimaryButtonClick, label: primaryButtonLabel } = primaryButton;

    const { close } = useDialogContext();
    return (
        <Dialog.Content className="flex flex-col gap-y-6 py-10">
            <div className="px-4">
                <div className="flex flex-col gap-y-3">
                    <Heading size="h3">{title}</Heading>
                    <p className="text-base font-normal leading-normal text-neutral-500">{description}</p>
                </div>
                <div className="flex flex-col">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-x-6 py-4">
                            <IllustrationObject
                                className="size-16 rounded-full border border-neutral-100"
                                object={step.icon}
                            />
                            <p className="grow py-4 font-normal leading-normal text-neutral-800">{step.label}</p>
                            <p className="text-base font-normal leading-normal text-neutral-500">
                                {t('app.shared.wizardDetailsDialog.step', { number: index + 1 })}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="flex gap-x-4 pt-6">
                    <Button
                        href={href}
                        onClick={() => {
                            onPrimaryButtonClick?.();
                            close();
                        }}
                    >
                        {primaryButtonLabel}
                    </Button>
                    <Button variant="tertiary" onClick={() => close()}>
                        {t('app.shared.wizardDetailsDialog.footer.cancel')}
                    </Button>
                </div>
            </div>
        </Dialog.Content>
    );
};
