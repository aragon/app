import { Button, Dialog, Heading, IllustrationObject, Link } from '@aragon/gov-ui-kit';
import { Description, Title } from '@radix-ui/react-dialog';
import { useDialogContext } from '../dialogProvider';
import { useTranslations } from '../translationsProvider';
import type { IWizardDetailsDialogProps } from './wizardDetailsDialog.api';

export const WizardDetailsDialog: React.FC<IWizardDetailsDialogProps> = (props) => {
    const { title, description, steps, infoLink, actionLabel, wizardLink, onActionClick, dialogId } = props;

    const { t } = useTranslations();

    const { close } = useDialogContext();

    const handleActionClick = () => {
        onActionClick?.();
        close(dialogId);
    };

    return (
        <Dialog.Content className="flex flex-col gap-y-6 px-12 py-10" noInset={true}>
            <div className="flex flex-col gap-y-3">
                <Title asChild={true}>
                    <Heading size="h3">{title}</Heading>
                </Title>
                <Description className="font-normal text-base text-neutral-500 leading-normal">{description}</Description>
                {infoLink && (
                    <Link href={infoLink} isExternal={true}>
                        {t('app.shared.wizardDetailsDialog.infoLabel')}
                    </Link>
                )}
            </div>
            <div className="flex flex-col">
                {steps.map((step, index) => (
                    <div className="flex items-center gap-x-6 py-4" key={index}>
                        <IllustrationObject className="size-16 rounded-full border border-neutral-100" object={step.icon} />
                        <p className="grow py-4 font-normal text-neutral-800 leading-normal">{step.label}</p>
                        <p className="font-normal text-base text-neutral-500 leading-normal">
                            {t('app.shared.wizardDetailsDialog.step', { number: index + 1 })}
                        </p>
                    </div>
                ))}
            </div>
            <div className="flex gap-x-4 pt-6">
                <Button href={wizardLink} onClick={handleActionClick}>
                    {actionLabel}
                </Button>
                <Button onClick={() => close()} variant="tertiary">
                    {t('app.shared.wizardDetailsDialog.footer.cancel')}
                </Button>
            </div>
        </Dialog.Content>
    );
};
