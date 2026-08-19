'use client';

import {
    AlertCard,
    Button,
    Checkbox,
    type CheckboxState,
    Clipboard,
    IconType,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcRecoveryShareCardProps {
    /**
     * Serialized recovery share (shown once, never stored by the server).
     */
    recoveryShareText: string;
    /**
     * Name of the file offered for download.
     */
    fileName: string;
    /**
     * Whether the user confirmed having stored the share.
     */
    acknowledged: boolean;
    /**
     * Callback called when the acknowledgement checkbox changes.
     */
    onAcknowledgedChange: (acknowledged: boolean) => void;
    /**
     * Error message displayed below the checkbox.
     */
    alertMessage?: string;
}

/**
 * Triggers a browser download of the given text (POC recovery share .txt).
 */
export const downloadTextFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
};

/**
 * POC / mock: shows the recovery share (share C) once, with copy / download actions and a confirmation checkbox.
 */
export const MpcRecoveryShareCard: React.FC<IMpcRecoveryShareCardProps> = (
    props,
) => {
    const {
        recoveryShareText,
        fileName,
        acknowledged,
        onAcknowledgedChange,
        alertMessage,
    } = props;
    const { t } = useTranslations();

    const handleCheckedChange = (checked: CheckboxState) =>
        onAcknowledgedChange(checked === true);

    return (
        <div className="flex flex-col gap-4">
            <AlertCard
                message={t('app.mpc.mpcRecoveryShareCard.warning.title')}
                variant="warning"
            >
                {t('app.mpc.mpcRecoveryShareCard.warning.description')}
            </AlertCard>
            <div className="flex flex-col gap-2 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <p className="text-neutral-500 text-sm">
                    {t('app.mpc.mpcRecoveryShareCard.label')}
                </p>
                <div className="flex items-start gap-2">
                    <code className="grow break-all font-mono text-neutral-800 text-sm">
                        {recoveryShareText}
                    </code>
                    <Clipboard copyValue={recoveryShareText} />
                </div>
            </div>
            <div>
                <Button
                    iconLeft={IconType.DEPOSIT}
                    onClick={() =>
                        downloadTextFile(fileName, recoveryShareText)
                    }
                    size="md"
                    variant="secondary"
                >
                    {t('app.mpc.mpcRecoveryShareCard.download')}
                </Button>
            </div>
            <Checkbox
                checked={acknowledged}
                label={t('app.mpc.mpcRecoveryShareCard.acknowledge')}
                onCheckedChange={handleCheckedChange}
            />
            {alertMessage != null && (
                <p className="text-critical-600 text-sm">{alertMessage}</p>
            )}
        </div>
    );
};
