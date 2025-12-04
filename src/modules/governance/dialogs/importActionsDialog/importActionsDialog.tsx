'use client';

import {
    proposalActionsImportExportUtils,
    type IExportedAction,
} from '@/modules/governance/utils/proposalActionsImportExportUtils';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AlertInline, Button, Dialog, invariant } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

export interface IImportActionsDialogParams {
    /**
     * Callback called when actions are successfully imported.
     */
    onImport: (actions: IExportedAction[]) => void;
}

export interface IImportActionsDialogProps extends IDialogComponentProps<IImportActionsDialogParams> {}

interface IImportActionsFormData {
    /**
     * The uploaded file.
     */
    file?: File;
}

export const ImportActionsDialog: React.FC<IImportActionsDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'ImportActionsDialog: params must be defined.');
    const { onImport } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { handleSubmit } = useForm<IImportActionsFormData>({
        mode: 'onSubmit',
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
            setError(null);
        }
    };

    const handleChooseFileClick = () => {
        fileInputRef.current?.click();
    };

    const onSubmit = handleSubmit(async () => {
        if (!selectedFile) {
            setError(t('app.governance.createProposalForm.actionsImportExport.errors.invalidJSON'));
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const fileContent = await proposalActionsImportExportUtils.readFileAsText(selectedFile);
            const result = proposalActionsImportExportUtils.validateAndParseActions(fileContent);

            if (result.success && result.actions) {
                onImport(result.actions);
                close();
            } else if (result.errorKey) {
                setError(t(result.errorKey));
            }
        } catch {
            setError(t('app.governance.createProposalForm.actionsImportExport.errors.invalidJSON'));
        } finally {
            setIsProcessing(false);
        }
    });

    return (
        <>
            <Dialog.Header
                title={t('app.governance.createProposalForm.actionsImportExport.import.title')}
                onClose={close}
            />
            <Dialog.Content className="flex flex-col gap-6">
                <p className="text-neutral-500">
                    {t('app.governance.createProposalForm.actionsImportExport.import.description')}
                </p>

                <form onSubmit={onSubmit} className="flex flex-col gap-6">
                    <div className="mb-2 flex flex-col">
                        <div
                            className={classNames(
                                'mb-4 flex flex-col gap-4 rounded-xl border p-4',
                                error && 'border-critical-400 border-solid',
                                selectedFile && !error && 'border-success-400 border-solid',
                                !error && !selectedFile && 'border-dashed border-neutral-300',
                            )}
                        >
                            <div className="flex flex-col gap-y-2">
                                <label className="text-sm font-medium text-neutral-800">
                                    {t('app.governance.createProposalForm.actionsImportExport.import.fileInputLabel')}
                                </label>
                                <p className="text-xs text-neutral-500">
                                    {t(
                                        'app.governance.createProposalForm.actionsImportExport.import.fileInputHelpText',
                                    )}
                                </p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className="flex w-full items-center gap-2">
                                <Button
                                    variant="tertiary"
                                    size="sm"
                                    onClick={handleChooseFileClick}
                                    type="button"
                                    className="w-fit shrink-0"
                                >
                                    {t('app.governance.createProposalForm.actionsImportExport.import.chooseFile')}
                                </Button>
                                {selectedFile ? (
                                    <p className="flex min-w-0 text-sm text-neutral-500">
                                        <span className="truncate">{selectedFile.name.replace(/\.[^.]+$/, '')}</span>
                                        <span className="shrink-0">
                                            {/\.[^.]+$/.exec(selectedFile.name)?.[0] ?? ''}
                                        </span>
                                    </p>
                                ) : (
                                    <p className="text-sm text-neutral-500">
                                        {t('app.governance.createProposalForm.actionsImportExport.import.noFileChosen')}
                                    </p>
                                )}
                            </div>
                        </div>
                        {error && <AlertInline variant="critical" message={error} />}
                    </div>
                </form>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.governance.createProposalForm.actionsImportExport.import.accept'),
                    onClick: onSubmit,
                    disabled: !selectedFile || isProcessing,
                    isLoading: isProcessing,
                }}
                secondaryAction={{
                    label: t('app.governance.createProposalForm.actionsImportExport.import.cancel'),
                    onClick: () => close(),
                }}
            />
        </>
    );
};
