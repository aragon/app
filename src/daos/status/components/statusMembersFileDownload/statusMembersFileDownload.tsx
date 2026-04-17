'use client';

import { Button, Card, IconType, InputContainer } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { Hex } from 'viem';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { StatusDialogId } from '../../constants/statusDialogId';
import type { IStatusMembersFileDownloadDialogParams } from '../../dialogs/statusMembersFileDownloadDialog';
import type { IStatusMembersFileDownloadProps } from './statusMembersFileDownload.api';

export const StatusMembersFileDownload: React.FC<
    IStatusMembersFileDownloadProps
> = (props) => {
    const { dao, asset } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const [downloadedFileName, setDownloadedFileName] = useState<string | null>(
        null,
    );

    const gaugePlugins = useDaoPlugins({
        daoId: dao.id,
        interfaceType: PluginInterfaceType.GAUGE_VOTER,
    });

    const gaugePluginAddress = gaugePlugins?.[0]?.meta?.address as
        | Hex
        | undefined;

    const handleClick = () => {
        if (gaugePluginAddress == null) {
            return;
        }

        const params: IStatusMembersFileDownloadDialogParams = {
            gaugePluginAddress,
            network: dao.network,
            asset,
            onDownload: setDownloadedFileName,
        };

        open(StatusDialogId.MEMBERS_FILE_DOWNLOAD, {
            params,
            disableOutsideClick: true,
        });
    };

    return (
        <InputContainer
            helpText={t('app.daos.status.statusMembersFileDownload.helpText')}
            id="status-members-file"
            label={t('app.daos.status.statusMembersFileDownload.label')}
            useCustomWrapper={true}
        >
            {downloadedFileName && (
                <Card className="border border-neutral-100 px-6 py-2 shadow-neutral-sm">
                    <p className="text-neutral-400 text-sm">
                        {t(
                            'app.daos.status.statusMembersFileDownload.downloadedFile',
                            {
                                fileName: downloadedFileName,
                            },
                        )}
                    </p>
                </Card>
            )}
            <Button
                className="w-fit"
                disabled={gaugePluginAddress == null}
                iconLeft={IconType.PLUS}
                onClick={handleClick}
                size="md"
                variant="tertiary"
            >
                {t('app.daos.status.statusMembersFileDownload.button')}
            </Button>
        </InputContainer>
    );
};
