'use client';

import { Button, Card, IconType, InputContainer } from '@aragon/gov-ui-kit';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import type { IGaugeVoterPlugin } from '@/plugins/gaugeVoterPlugin/types';
import { type IDao, PluginInterfaceType } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { CapitalDistributorTestDialogId } from '../constants/capitalDistributorTestDialogId';
import type { ICapitalDistributorTestMembersFileDownloadDialogParams } from '../dialogs/capitalDistributorTestMembersFileDownloadDialog';

export interface ICapitalDistributorTestMembersFileDownloadProps
    extends ComponentProps<'header'> {
    /**
     * DAO to display in the header.
     */
    dao: IDao;
}

export const CapitalDistributorTestMembersFileDownload: React.FC<
    ICapitalDistributorTestMembersFileDownloadProps
> = (props) => {
    const { dao } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const [downloadedFileName, setDownloadedFileName] = useState<string | null>(
        null,
    );

    const gaugePlugins = useDaoPlugins({
        daoId: dao.id,
        interfaceType: PluginInterfaceType.GAUGE_VOTER,
    });
    const gaugePlugin = gaugePlugins?.[0]?.meta as IGaugeVoterPlugin;

    const handleClick = () => {
        if (gaugePlugin?.address == null) {
            return;
        }

        const params: ICapitalDistributorTestMembersFileDownloadDialogParams = {
            gaugePlugin,
            network: dao.network,
            onDownload: setDownloadedFileName,
        };

        open(CapitalDistributorTestDialogId.MEMBERS_FILE_DOWNLOAD, {
            params,
            disableOutsideClick: true,
        });
    };

    return (
        <InputContainer
            helpText={t(
                'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownload.helpText',
            )}
            id="katana-members-file"
            label={t(
                'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownload.label',
            )}
            useCustomWrapper={true}
        >
            {downloadedFileName && (
                <Card className="border border-neutral-100 px-6 py-2 shadow-neutral-sm">
                    <p className="text-neutral-400 text-sm">
                        {t(
                            'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownload.downloadedFile',
                            { fileName: downloadedFileName },
                        )}
                    </p>
                </Card>
            )}
            <Button
                className="w-fit"
                disabled={gaugePlugin?.address == null}
                iconLeft={IconType.PLUS}
                onClick={handleClick}
                size="md"
                variant="tertiary"
            >
                {t(
                    'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownload.button',
                )}
            </Button>
        </InputContainer>
    );
};
