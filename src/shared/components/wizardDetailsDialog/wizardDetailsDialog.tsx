import { Button, Dialog, Heading, IconType, IllustrationObject, Link } from '@aragon/gov-ui-kit';
import { useDialogContext } from '../dialogProvider';
import { useTranslations } from '../translationsProvider';
import type { IWizardDetailsDialogProps } from './wizardDetailsDialog.api';

export const WizardDetailsDialog: React.FC<IWizardDetailsDialogProps> = (props) => {
    const { title, description, steps, primaryButton, link } = props;

    const { t } = useTranslations();
    const { href: primaryButtonHref, onPrimaryButtonClick, label: primaryButtonLabel } = primaryButton;

    const { close } = useDialogContext();
    return (
        <Dialog.Content className="flex flex-col gap-y-6 py-10">
            <div className="px-4">
                <div className="flex flex-col gap-y-3">
                    <Heading size="h3">{title}</Heading>
                    <p className="text-base font-normal leading-normal text-neutral-500">{description}</p>
                    {link && (
                        <Link iconRight={IconType.LINK_EXTERNAL} href={link.href}>
                            {link.label}
                        </Link>
                    )}
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
                        href={primaryButtonHref}
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
