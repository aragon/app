import {
    Button,
    DefinitionList,
    DialogAlert,
    DialogAlertFooter,
    invariant,
    Link,
    Tag,
} from '@aragon/gov-ui-kit';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDuplicateProposalAlertDialogProps } from './duplicateProposalAlertDialog.api';

const namespace = 'app.governance.duplicateProposalAlertDialog';

export const DuplicateProposalAlertDialog: React.FC<
    IDuplicateProposalAlertDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'DuplicateProposalAlertDialog: required parameters must be set.',
    );

    const { onProceed, pending } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const handleProceed = () => {
        close();
        onProceed();
    };

    const handleReturn = (onReturn: () => void) => () => {
        close();
        onReturn();
    };

    return (
        <>
            <DialogAlert.Header title={t(`${namespace}.title`)} />
            <DialogAlert.Content>
                <div className="flex flex-col gap-y-4 pb-4 font-normal text-base text-neutral-500 leading-normal">
                    <p>{t(`${namespace}.description.1`)}</p>
                    <p>{t(`${namespace}.description.2`)}</p>
                    <DefinitionList.Container>
                        {pending.map((item, index) => (
                            <DefinitionList.Item
                                key={`${item.status}-${item.transactionUrl ?? item.title ?? index}`}
                                term={item.title ?? t(`${namespace}.untitled`)}
                            >
                                <div className="flex flex-col items-start gap-y-3">
                                    <Tag
                                        label={t(
                                            `${namespace}.status.${item.status}`,
                                        )}
                                        variant={
                                            item.status === 'submitted'
                                                ? 'info'
                                                : 'warning'
                                        }
                                    />
                                    {item.transactionUrl != null && (
                                        <Link
                                            href={item.transactionUrl}
                                            isExternal={true}
                                        >
                                            {t(
                                                `${namespace}.link.viewTransaction`,
                                            )}
                                        </Link>
                                    )}
                                    {item.onReturn != null && (
                                        <Button
                                            onClick={handleReturn(
                                                item.onReturn,
                                            )}
                                            size="sm"
                                            variant="secondary"
                                        >
                                            {t(`${namespace}.action.return`)}
                                        </Button>
                                    )}
                                </div>
                            </DefinitionList.Item>
                        ))}
                    </DefinitionList.Container>
                </div>
            </DialogAlert.Content>
            {/* "Publish anyway" is the warning (yellow) action and, for a warning alert, renders on the
                right; "Go back" is the subdued/safe choice. */}
            <DialogAlertFooter
                actionButton={{
                    label: t(`${namespace}.action.publish`),
                    onClick: handleProceed,
                }}
                cancelButton={{
                    label: t(`${namespace}.action.back`),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
