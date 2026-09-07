import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import type {
    ICreateProposalFormData,
    IProposalActionData,
} from '../../components/createProposalForm';
import { useCreateProposalFormContext } from '../../components/createProposalForm';
import type { IProposalCreateAction } from '../../dialogs/publishProposalDialog';
import { proposalActionPreparationUtils } from '../../utils/proposalActionPreparationUtils';
import { proposalActionsImportExportUtils } from '../../utils/proposalActionsImportExportUtils';

export interface IUseDownloadProposalActionsParams {
    /**
     * ID of the DAO the actions are composed for. Used to name the downloaded file and to enrich the
     * error context. Omit when the actions are composed outside a DAO context.
     */
    daoId?: string;
}

/**
 * Downloads the actions of the surrounding form as a JSON file, running the registered prepare
 * functions first so that actions needing async work (e.g. IPFS pinning) export their final calldata.
 * Must be called within a form context holding an `actions` array and a `CreateProposalFormProvider`.
 */
export const useDownloadProposalActions = (
    params: IUseDownloadProposalActionsParams = {},
) => {
    const { daoId } = params;

    const { getValues } =
        useFormContext<Pick<ICreateProposalFormData, 'actions'>>();
    const { prepareActions } = useCreateProposalFormContext();

    const [isPinning, setIsPinning] = useState(false);
    const [hasPinErrors, setHasPinErrors] = useState(false);

    const handleDownloadActions = useCallback(async () => {
        setIsPinning(true);
        setHasPinErrors(false);

        try {
            const currentActions: IProposalActionData[] =
                getValues('actions') ?? [];

            // Prepare actions using registered prepare functions
            const preparedActions =
                await proposalActionPreparationUtils.prepareActions({
                    actions: currentActions as IProposalCreateAction[],
                    prepareActions,
                });

            const fileName =
                daoId != null ? `dao-${daoId}-actions.json` : 'actions.json';

            proposalActionsImportExportUtils.downloadActionsAsJSON(
                preparedActions as unknown as IProposalAction[],
                fileName,
            );
        } catch (error) {
            monitoringUtils.logError(error, {
                context: {
                    daoId,
                    message:
                        'Failed to pin or download proposal actions for DAO',
                },
            });
            setHasPinErrors(true);
        } finally {
            setIsPinning(false);
        }
    }, [daoId, getValues, prepareActions]);

    return {
        /**
         * Whether the actions are currently being prepared (e.g. pinned to IPFS) for the download.
         */
        isPinning,
        /**
         * Whether the last download attempt failed while preparing the actions.
         */
        hasPinErrors,
        /**
         * Prepares and downloads the current actions as a JSON file.
         */
        handleDownloadActions,
    };
};
