import { Button, type ChainEntityType, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IProcessedSimulation } from '../../utils/simulationTypes';
import { SimulationFlowVisualizationItem } from './simulationFlowVisualizationItem';
import { simulationFlowVisualizationUtils } from './simulationFlowVisualizationUtils';

export interface ISimulationFlowVisualizationProps {
    /**
     * The simulation data to display.
     */
    simulation: IProcessedSimulation;
    /**
     * Additional CSS classes.
     */
    className?: string;
    /**
     * Whether to show a compact version (hides fallback address when no link).
     */
    compact?: boolean;
    /**
     * Function to build entity URLs for addresses.
     */
    buildEntityUrl?: (params: {
        type: ChainEntityType;
        id?: string;
        chainId?: number;
    }) => string | undefined;
}

export const SimulationFlowVisualization: React.FC<
    ISimulationFlowVisualizationProps
> = (props) => {
    const { simulation, className, compact = false, buildEntityUrl } = props;

    const { t } = useTranslations();
    const { summaryGroups } = simulation;

    if (summaryGroups.length === 0) {
        return (
            <div
                className={classNames(
                    'flex flex-col gap-section--fixed-32',
                    className,
                )}
            >
                <p className="text-sm text-neutral-500">
                    {t(
                        'app.capitalFlow.simulationFlowVisualization.summary.empty',
                    )}
                </p>
            </div>
        );
    }

    return (
        <div
            className={classNames(
                'flex flex-col gap-section--fixed-32',
                className,
            )}
        >
            {summaryGroups.map((group) => (
                <div
                    className="flex w-full flex-col gap-related"
                    key={group.kind}
                >
                    <p className="text-xl leading-tight text-neutral-800">
                        {t(
                            simulationFlowVisualizationUtils.getGroupTitleKey(
                                group,
                            ),
                        )}
                    </p>
                    <div className="flex w-full flex-col gap-related">
                        {group.items.map((item) => (
                            <SimulationFlowVisualizationItem
                                buildEntityUrl={buildEntityUrl}
                                compact={compact}
                                groupKind={group.kind}
                                item={item}
                                key={item.address}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {simulation.tenderlyUrl && (
                <Button
                    className="w-fit"
                    href={simulation.tenderlyUrl}
                    iconRight={IconType.LINK_EXTERNAL}
                    size="md"
                    target="_blank"
                    variant="secondary"
                >
                    {t(
                        'app.capitalFlow.simulationFlowVisualization.tenderlyLink',
                    )}
                </Button>
            )}
        </div>
    );
};
