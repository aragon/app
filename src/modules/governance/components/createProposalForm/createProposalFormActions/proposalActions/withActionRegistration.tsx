import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import type { ComponentType } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import type { IProposalActionData } from '../../../createProposalFormDefinitions';

/**
 * A Higher-Order Component (HOC) that wraps a proposal action component.
 * It dynamically registers common static properties of an action as hidden
 * form fields. This ensures that react-hook-form tracks these properties
 * during array manipulations (move, remove, etc.), preventing data loss
 * and corruption.
 *
 * @param WrappedComponent The action component to wrap.
 * @returns A new component that includes the hidden fields and the wrapped component.
 */
export const withActionRegistration = <T extends IProposalActionComponentProps<IProposalActionData>>(
    WrappedComponent: ComponentType<T>,
) => {
    const WithActionRegistration = (props: T) => {
        const { index } = props;
        const { register, control } = useFormContext();
        const fieldName = `actions.[${index.toString()}]`;

        // Register complex fields like arrays with `useController` to ensure they are tracked.
        useController({
            name: `${fieldName}.inputData.parameters`,
            control,
        });

        return (
            <>
                {/* Hidden fields to ensure RHF tracks simple static data during array operations */}
                <input type="hidden" {...register(`${fieldName}.type`)} />
                <input type="hidden" {...register(`${fieldName}.to`)} />
                <input type="hidden" {...register(`${fieldName}.from`)} />
                <input type="hidden" {...register(`${fieldName}.daoId`)} />
                <input type="hidden" {...register(`${fieldName}.inputData.function`)} />
                <input type="hidden" {...register(`${fieldName}.inputData.contract`)} />

                <WrappedComponent {...props} />
            </>
        );
    };

    WithActionRegistration.displayName = `withActionRegistration(${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;

    return WithActionRegistration;
};
