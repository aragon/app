import {
    Button,
    Dialog,
    Heading,
    IllustrationObject,
    Link,
} from '@aragon/gov-ui-kit';
import { Description, Title } from '@radix-ui/react-dialog';
import { useDialogContext } from '../dialogProvider';
import { useTranslations } from '../translationsProvider';
import type { IWizardDetailsDialogProps } from './wizardDetailsDialog.api';

export const WizardDetailsDialog: React.FC<IWizardDetailsDialogProps> = (
    props,
) => {
    const {
        title,
        description,
        steps,
        infoLink,
        actionLabel,
        wizardLink,
        onActionClick,
        dialogId,
    } = props;

    const { t } = useTranslations();

    const { close } = useDialogContext();

    const handleActionClick = () => {
        onActionClick?.();
        close(dialogId);
    };

    return (
        <Dialog.Content
            className="flex flex-col gap-y-section px-12 py-10 md:px-6"
            noInset={true}
        >
            <div className="flex flex-col gap-y-related">
                <Title asChild={true}>
                    <Heading size="h3">{title}</Heading>
                </Title>
                <Description className="text-base leading-normal font-normal text-surface-secondary">
                    {description}
                </Description>
                {infoLink && (
                    <Link href={infoLink} isExternal={true}>
                        {t('app.shared.wizardDetailsDialog.infoLabel')}
                    </Link>
                )}
            </div>
            <div className="flex flex-col">
                {steps.map((step, index) => (
                    <div
                        className="my-group flex items-center gap-x-section"
                        // biome-ignore lint/suspicious/noArrayIndexKey: static steps list, never reordered
                        key={index}
                    >
                        <IllustrationObject
                            className="size-16 rounded-full border border-surface-secondary"
                            object={step.icon}
                        />
                        <p className="my-group grow leading-normal font-normal text-surface-primary">
                            {step.label}
                        </p>
                        <p className="text-base leading-normal font-normal text-surface-secondary">
                            {t('app.shared.wizardDetailsDialog.step', {
                                number: index + 1,
                            })}
                        </p>
                    </div>
                ))}
            </div>
            <div className="mt-section flex gap-x-group">
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
