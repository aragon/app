import { Button, Dialog, IconType, invariant } from '@aragon/gov-ui-kit';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IProposalAudit } from '../../api/governanceService/domain';

export interface IProposalAuditDialogParams {
    /**
     * Audit payload to render. Either a freshly-produced result from the
     * `POST /v2/proposals/:id/audit` endpoint or the cached one persisted on
     * the Proposal document.
     */
    audit: IProposalAudit;
}

export interface IProposalAuditDialogProps
    extends IDialogComponentProps<IProposalAuditDialogParams> {}

export const ProposalAuditDialog: React.FC<IProposalAuditDialogProps> = (
    props,
) => {
    const { params } = props.location;

    invariant(
        params != null,
        'ProposalAuditDialog: params must be set for the dialog to work correctly',
    );

    const { audit } = params;

    const { t } = useTranslations();

    return (
        <>
            <Dialog.Header
                title={t('app.governance.proposalAuditDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-4 pb-3">
                <section className="flex flex-col gap-2">
                    <h3 className="font-semibold text-base text-neutral-800">
                        {t('app.governance.proposalAuditDialog.summary')}
                    </h3>
                    <p className="text-neutral-600 text-sm whitespace-pre-line">
                        {audit.summary}
                    </p>
                </section>

                {audit.tenderlyUrl && (
                    <footer className="flex flex-wrap items-center gap-3 border-neutral-100 border-t pt-3">
                        <Button
                            href={audit.tenderlyUrl}
                            iconRight={IconType.LINK_EXTERNAL}
                            size="sm"
                            target="_blank"
                            variant="tertiary"
                        >
                            {t(
                                'app.governance.proposalAuditDialog.tenderlyLink',
                            )}
                        </Button>
                    </footer>
                )}
            </Dialog.Content>
        </>
    );
};