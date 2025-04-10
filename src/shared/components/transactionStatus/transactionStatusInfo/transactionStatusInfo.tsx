import { useTranslations } from '@/shared/components/translationsProvider';
import { Heading, invariant } from '@aragon/gov-ui-kit';
import classNames from 'classnames';

export interface ITransactionInfo {
    /**
     * Current title of the stepper.
     */
    title: string;
    /**
     * Current phase of the stepper based on the active dialog.
     */
    current?: number;
    /**
     * Total number of phases in the dialog flow.
     */
    total?: number;
}

export interface ITransactionStatusInfoProps extends ITransactionInfo {
    /**
     * Additional class names to be applied to the component.
     */
    className?: string;
}

export const TransactionStatusInfo: React.FC<ITransactionStatusInfoProps> = (props) => {
    const { title, current, total, className } = props;

    invariant((current == null) === (total == null), 'TransactionStatusInfo: current and total must be set together');

    const { t } = useTranslations();

    const isMultiphase = current != null && total != null;

    return (
        <div className={classNames('flex items-center justify-between', className)}>
            <Heading size="h4" className="truncate">
                {title}
            </Heading>
            {isMultiphase && (
                <div className="flex flex-row gap-1 text-sm font-normal leading-tight md:text-base">
                    <span>{t('app.shared.transactionStatus.info.current', { current })}</span>
                    <span className="text-neutral-500">{t('app.shared.transactionStatus.info.total', { total })}</span>
                </div>
            )}
        </div>
    );
};
