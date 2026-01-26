'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { GaugeVoterLockList } from '../../components/gaugeVoterLockList';
import type { IGaugeVoterPluginSettings } from '../../types/gaugeVoterPlugin';

export interface IGaugeVoterLocksDialogParams {
    /**
     * DAO with the gauge-voter plugin.
     */
    dao: IDao;
    /**
     * Gauge voter plugin containing voting escrow settings.
     */
    plugin: IDaoPlugin<IGaugeVoterPluginSettings>;
}

export interface IGaugeVoterLocksDialogProps
    extends IDialogComponentProps<IGaugeVoterLocksDialogParams> {}

export const GaugeVoterLocksDialog: React.FC<IGaugeVoterLocksDialogProps> = (
    props,
) => {
    const { location } = props;
    invariant(
        location.params != null,
        'GaugeVoterLocksDialog: required parameters must be set.',
    );
    const { plugin, dao } = location.params;

    const { t } = useTranslations();

    const { close } = useDialogContext();

    const { token } = plugin.settings;

    return (
        <>
            <Dialog.Header
                onClose={close}
                title={t('app.plugins.token.tokenLocksDialog.title')}
            />
            <Dialog.Content
                className="pb-4 md:pb-6"
                description={t(
                    'app.plugins.token.tokenLocksDialog.description',
                    { symbol: token.symbol },
                )}
            >
                <GaugeVoterLockList dao={dao} plugin={plugin} />
            </Dialog.Content>
        </>
    );
};
