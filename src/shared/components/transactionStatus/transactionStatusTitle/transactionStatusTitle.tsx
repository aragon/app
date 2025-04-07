import { useTranslations } from '@/shared/components/translationsProvider';
import type { IStepperPhase } from '@/shared/hooks/useStepper';
import { Heading } from '@aragon/gov-ui-kit';

export interface ITransactionStatusTitle extends IStepperPhase {}

export const TransactionStatusTitle: React.FC<ITransactionStatusTitle> = (props) => {
    const { title, current, total } = props;

    const { t } = useTranslations();

    return (
        <div className="flex items-center justify-between">
            <Heading size="h4">{title}</Heading>
            <div className="flex flex-row gap-1 text-sm font-normal leading-tight md:text-base">
                <span>{t('app.shared.transactionDialog.statusTitle.phaseCurrent', { current })}</span>
                <span className="text-neutral-500">
                    {t('app.shared.transactionDialog.statusTitle.phaseTotal', { total })}
                </span>
            </div>
        </div>
    );
};
