'use client';

import type { IProposalAction } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { encodeFunctionData } from 'viem';

export interface IUsePermissionActionEncoderParams {
    /**
     * Action whose decoded parameters describe the function being encoded.
     */
    action: Pick<IProposalAction, 'inputData'>;
    /**
     * Form prefix of the action, e.g. `actions.0`.
     */
    fieldPrefix: string;
}

/**
 * Keeps an action's calldata in step with its parameter values.
 *
 * Once an action has a BASIC view the kit puts its DECODED view in watch mode and
 * stops re-encoding, so the composer writes the calldata itself, from the same
 * parameter fields the DECODED view displays.
 */
export const usePermissionActionEncoder = (
    params: IUsePermissionActionEncoderParams,
): void => {
    const { action, fieldPrefix } = params;

    const { setValue, getValues } = useFormContext();

    const parameters = action.inputData?.parameters;
    const functionName = action.inputData?.function;

    const watchedParameters = useWatch({
        name: `${fieldPrefix}.inputData.parameters`,
    }) as Array<{ value?: unknown }> | undefined;

    useEffect(() => {
        if (
            functionName == null ||
            parameters == null ||
            parameters.length === 0
        ) {
            return;
        }

        const args = parameters.map(
            (_, parameterIndex) => watchedParameters?.[parameterIndex]?.value,
        );
        const actionAbi = [
            { type: 'function', name: functionName, inputs: parameters },
        ];

        let encodedData = '0x';

        try {
            encodedData = encodeFunctionData({ abi: actionAbi, args });
        } catch {
            // A half-filled form does not encode; leave the calldata empty until it does.
        }

        const dataFieldName = `${fieldPrefix}.data`;

        if (getValues(dataFieldName) !== encodedData) {
            setValue(dataFieldName, encodedData);
        }
    }, [
        fieldPrefix,
        functionName,
        getValues,
        parameters,
        setValue,
        watchedParameters,
    ]);
};
