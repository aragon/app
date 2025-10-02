import type { Network } from '@/shared/api/daoService';
import { GaugeVoterGaugesPageClient } from './gaugeVoterGaugesPageClient';
import type { IGaugeVoterPlugin } from '../../types';

export interface IGaugeVoterGaugesPageProps {
    /**
     * Gauge voter plugin instance.
     */
    plugin: IGaugeVoterPlugin;
    /**
     * Network of the plugin.
     */
    network: Network;
}

export const GaugeVoterGaugesPage: React.FC<IGaugeVoterGaugesPageProps> = (props) => {
    const { plugin, network } = props;

    return (
        <div className="min-h-screen bg-neutral-0">
            <GaugeVoterGaugesPageClient plugin={plugin} network={network} />
        </div>
    );
};