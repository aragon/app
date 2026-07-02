import {
    Button,
    DataList,
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
                    <DataList.Root entityLabel={t(`${namespace}.entityLabel`)}>
                        {pending.map((item, index) => (
                            <DataList.Item
                                className="flex flex-col gap-3 p-4 md:p-6"
                                key={`${item.status}-${item.transactionUrl ?? item.title ?? index}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <p className="truncate font-normal text-base text-neutral-800 leading-tight md:text-lg">
                                        {item.title ??
                                            t(`${namespace}.untitled`)}
                                    </p>
                                    <Tag
                                        className="shrink-0"
                                        label={t(
                                            `${namespace}.status.${item.status}`,
                                        )}
                                        variant={
                                            item.status === 'submitted'
                                                ? 'info'
                                                : 'warning'
                                        }
                                    />
                                </div>
                                {(item.transactionUrl != null ||
                                    item.onReturn != null) && (
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
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
                                                {t(
                                                    `${namespace}.action.return`,
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </DataList.Item>
                        ))}
                    </DataList.Root>
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
