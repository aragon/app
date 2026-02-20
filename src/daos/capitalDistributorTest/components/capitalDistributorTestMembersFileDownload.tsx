'use client';

import { Button, IconType, InputContainer } from '@aragon/gov-ui-kit';
import type { ComponentProps } from 'react';
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

    const gaugePlugins = useDaoPlugins({
        daoId: dao.id,
        interfaceType: PluginInterfaceType.GAUGE_VOTER,
    });
    const gaugePlugin = gaugePlugins?.[0]?.meta;

    const handleClick = () => {
        if (gaugePlugin?.address == null) {
            return;
        }
        console.log('gaugePluginAddress', gaugePlugin.address);
        const params: ICapitalDistributorTestMembersFileDownloadDialogParams = {
            gaugePluginAddress: gaugePlugin.address as `0x${string}`,
            network: dao.network,
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
            isOptional={true}
            label={t(
                'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownload.label',
            )}
            useCustomWrapper={true}
        >
            <Button
                className="w-fit"
                disabled={gaugePlugin?.address == null}
                iconLeft={IconType.REWARDS}
                onClick={handleClick}
                variant="tertiary"
            >
                {t(
                    'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownload.button',
                )}
            </Button>
        </InputContainer>
    );
};
