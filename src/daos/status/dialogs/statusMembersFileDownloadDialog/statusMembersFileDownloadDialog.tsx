'use client';

import {
    Dialog,
    DropdownContainer,
    DropdownItem,
    InputContainer,
    InputNumber,
    invariant,
} from '@aragon/gov-ui-kit';
import { useEffect, useMemo, useState } from 'react';
import { type Hex, parseUnits } from 'viem';
import { rewardUtils } from '@/daos/katana/utils/rewardUtils';
import type { IAsset } from '@/modules/finance/api/financeService';
import {
    useEpochMetrics,
    useRewardDistribution,
} from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService';
import type { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { StatusDialogId } from '../../constants/statusDialogId';
import { statusMinEpochId } from '../../constants/statusMinEpochId';

export interface IStatusMembersFileDownloadDialogParams {
    /**
     * Address of the gauge voter plugin.
     */
    gaugePluginAddress: `0x${string}`;
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * Asset selected in the campaign creation form.
     */
    asset?: IAsset;
    /**
     * Called with the downloaded file name after a successful download.
     */
    onDownload?: (fileName: string) => void;
}

export interface IStatusMembersFileDownloadDialogProps
    extends IDialogComponentProps<IStatusMembersFileDownloadDialogParams> {}

export const StatusMembersFileDownloadDialog: React.FC<
    IStatusMembersFileDownloadDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'StatusMembersFileDownloadDialog: params must be defined',
    );

    const { gaugePluginAddress, network, asset } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const [totalAmount, setTotalAmount] = useState('');
    const [epochId, setEpochId] = useState('');

    const epochMetrics = useEpochMetrics({
        urlParams: {
            pluginAddress: gaugePluginAddress as Hex,
            network,
        },
        queryParams: {},
    });

    const currentEpochId = epochMetrics.data?.epochId
        ? Number(epochMetrics.data.epochId)
        : undefined;

    useEffect(() => {
        if (currentEpochId != null && epochId === '') {
            setEpochId(String(currentEpochId));
        }
    }, [currentEpochId, epochId]);

    const validEpochs = useMemo(() => {
        if (currentEpochId == null) {
            return [];
        }

        const epochs: number[] = [];

        const firstEpoch =
            statusMinEpochId > currentEpochId ? 1 : statusMinEpochId;

        for (
            let i = currentEpochId;
            i >= firstEpoch && epochs.length < 100;
            i--
        ) {
            epochs.push(i);
        }

        return epochs;
    }, [currentEpochId]);

    const tokenDecimals = asset?.token.decimals ?? 18;
    const tokenSymbol = asset?.token.symbol;

    const totalAmountInUnits = useMemo(
        () =>
            totalAmount
                ? parseUnits(totalAmount, tokenDecimals).toString()
                : '',
        [totalAmount, tokenDecimals],
    );

    const rewardDistribution = useRewardDistribution(
        {
            urlParams: {
                pluginAddress: gaugePluginAddress as Hex,
                network,
                epochId: Number(epochId),
            },
            queryParams: {
                rewardTotalAmount: totalAmountInUnits,
            },
        },
        { enabled: false },
    );

    const errorCode =
        rewardDistribution.error &&
        (rewardDistribution.error as AragonBackendServiceError).code;
    const errorKey =
        errorCode &&
        [
            'epochWindowInvalid',
            'epochVotingNotClosed',
            'epochWindowExpired',
            'epochNoActiveVoters',
        ].includes(errorCode)
            ? errorCode
            : 'default';

    const isFormValid = totalAmount !== '' && epochId !== '';

    const handleGenerate = () => {
        rewardDistribution.refetch().then((result) => {
            if (result.data == null) {
                return;
            }

            const rewardJson = rewardUtils.toRewardJson({
                owners: result.data.owners,
            });

            const blob = new Blob([JSON.stringify(rewardJson, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            const fileName = `status-reward-distribution-epoch-${result.data.epoch}.json`;
            anchor.href = url;
            anchor.download = fileName;
            anchor.click();
            URL.revokeObjectURL(url);
            location.params?.onDownload?.(fileName);
            handleClose();
        });
    };

    const handleClose = () => {
        close(StatusDialogId.MEMBERS_FILE_DOWNLOAD);
    };

    const selectedEpochLabel =
        epochId !== ''
            ? t('app.daos.status.statusMembersFileDownloadDialog.epochOption', {
                  epochId,
              })
            : t(
                  'app.daos.status.statusMembersFileDownloadDialog.epochSelectPlaceholder',
              );

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.daos.status.statusMembersFileDownloadDialog.description',
                )}
                title={t(
                    'app.daos.status.statusMembersFileDownloadDialog.title',
                )}
            />
            <Dialog.Content>
                <div className="flex flex-col gap-6 py-2">
                    <InputContainer
                        helpText={t(
                            'app.daos.status.statusMembersFileDownloadDialog.epochIdHelpText',
                        )}
                        id="epoch-select"
                        label={t(
                            'app.daos.status.statusMembersFileDownloadDialog.epochIdLabel',
                        )}
                        useCustomWrapper={true}
                    >
                        <div className="w-fit">
                            <DropdownContainer
                                disabled={validEpochs.length === 0}
                                label={selectedEpochLabel}
                                size="md"
                                variant="tertiary"
                            >
                                {validEpochs.map((epoch) => (
                                    <DropdownItem
                                        key={epoch}
                                        onSelect={() =>
                                            setEpochId(String(epoch))
                                        }
                                        selected={epochId === String(epoch)}
                                    >
                                        {t(
                                            'app.daos.status.statusMembersFileDownloadDialog.epochOption',
                                            { epochId: epoch },
                                        )}
                                    </DropdownItem>
                                ))}
                            </DropdownContainer>
                        </div>
                    </InputContainer>
                    <InputNumber
                        label={t(
                            'app.daos.status.statusMembersFileDownloadDialog.amountLabel',
                        )}
                        min={0}
                        onChange={setTotalAmount}
                        placeholder="0"
                        suffix={tokenSymbol}
                        value={totalAmount}
                    />
                    {rewardDistribution.isError && (
                        <p className="text-critical-600 text-sm">
                            {t(
                                `app.daos.status.statusMembersFileDownloadDialog.error.${errorKey}`,
                            )}
                        </p>
                    )}
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.daos.status.statusMembersFileDownloadDialog.generate',
                    ),
                    onClick: handleGenerate,
                    disabled: !isFormValid,
                    isLoading: rewardDistribution.isFetching,
                }}
                secondaryAction={{
                    label: t(
                        'app.daos.status.statusMembersFileDownloadDialog.cancel',
                    ),
                    onClick: handleClose,
                }}
            />
        </>
    );
};
