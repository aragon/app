import type { IUseFormFieldReturn } from '@/shared/hooks/useFormField';
import type { IDateDuration, IDateFixed } from '@/shared/utils/dateUtils';
import { AlertCard, AlertInline } from '@aragon/gov-ui-kit';
import type { IAdvancedDateInputBaseProps } from './advancedDateInput.api';

export interface IAdvancedDateInputInfoTextProps extends Pick<IAdvancedDateInputBaseProps, 'infoText' | 'infoDisplay'> {
    /**
     * Form field to display the info text for.
     */
    field: IUseFormFieldReturn<Record<string, IDateFixed | IDateDuration | number>, string>;
}

export const AdvancedDateInputInfoText: React.FC<IAdvancedDateInputInfoTextProps> = (props) => {
    const { field, infoText, infoDisplay = 'card' } = props;

    const alertDescription = field.alert?.message ?? infoText;
    const alertVariant = field.alert != null ? 'critical' : 'info';

    if (alertDescription == null) {
        return null;
    }

    return infoDisplay === 'card' ? (
        <AlertCard message={field.label!} description={alertDescription} variant={alertVariant} />
    ) : (
        <AlertInline message={alertDescription} variant={alertVariant} />
    );
};
