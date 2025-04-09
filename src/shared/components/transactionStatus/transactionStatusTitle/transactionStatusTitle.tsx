import { useTranslations } from '@/shared/components/translationsProvider';
import type { IMultistep } from '@/shared/hooks/useStepper';
import { Heading } from '@aragon/gov-ui-kit';

export interface ITransactionStatusTitleProps {
    /**
     * Title of the stepper based on the active dialog phase.
     */
    title: string;
    /**
     * Current phase number and total number of phases of the stepper.
     * `title` is destructured and used externally if multistep is defined.
     */
    multistep?: IMultistep;
}

export const TransactionStatusTitle: React.FC<ITransactionStatusTitleProps> = (props) => {
    const { title, multistep } = props;
    const { current, total } = multistep ?? {};

    const { t } = useTranslations();

    return (
        <div className="flex items-center justify-between">
            <Heading size="h4" className="truncate">
                {title}
            </Heading>
            {multistep != null && (
                <div className="flex flex-row gap-1 text-sm font-normal leading-tight md:text-base">
                    <span>{t('app.shared.transactionDialog.statusTitle.multistepCurrent', { current })}</span>
                    <span className="text-neutral-500">
                        {t('app.shared.transactionDialog.statusTitle.multistepTotal', { total })}
                    </span>
                </div>
            )}
        </div>
    );
};
