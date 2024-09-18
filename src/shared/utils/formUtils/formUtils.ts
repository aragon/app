// formUtils.ts
import { type FieldPath, type FieldValues, type UseControllerReturn } from 'react-hook-form';

export interface ITrimOnBlurParams<TFieldValues extends FieldValues> {
    /**
     * The blur event from the input element.
     */
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement>;
    /**
     * The field controller from React Hook Form.
     */
    field: UseControllerReturn<TFieldValues, FieldPath<TFieldValues>>['field'];
}

class FormUtils {
    trimOnBlur = <TFieldValues extends FieldValues>(params: ITrimOnBlurParams<TFieldValues>) => {
        const { event, field } = params;

        if ('value' in event.target) {
            const trimmedValue = event.target.value.trim();
            field.onChange(trimmedValue);
        }
        field.onBlur();
    };
}

export const formUtils = new FormUtils();
