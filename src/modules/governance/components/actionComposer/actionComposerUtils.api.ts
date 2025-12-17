import type { IDao } from '@/shared/api/daoService';
import type { IAutocompleteInputGroup } from '@/shared/components/forms/autocompleteInput';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import type { IAllowedAction } from '../../api/executeSelectorsService';
import type { ISmartContractAbi } from '../../api/smartContractService';
import type { IActionComposerInputItem, IActionComposerInputProps } from './actionComposerInput';

export enum ActionItemId {
    CUSTOM_ACTION = 'CUSTOM_ACTION',
    ADD_CONTRACT = 'ADD_CONTRACT',
    RAW_CALLDATA = 'RAW_CALLDATA',
}

export interface IGetActionBaseParams {
    /**
     * DAO to build the native action groups for.
     */
    dao?: IDao;
    /**
     * Translation function for group labels.
     */
    t: TranslationFunction;
}

export interface IGetNativeActionGroupsParams extends IGetActionBaseParams {
    /**
     * Additional action groups.
     */
    nativeGroups: IAutocompleteInputGroup[];
}

export interface IGetNativeActionItemsParams extends IGetActionBaseParams {
    /**
     * Additional action items.
     */
    nativeItems: IActionComposerInputItem[];
}

export interface IGetCustomActionParams extends IGetActionBaseParams {
    /**
     * Smart contract ABIs to be processed.
     */
    abis: ISmartContractAbi[];
}

export interface IGetActionItemsParams
    extends IGetCustomActionParams,
        IGetNativeActionItemsParams,
        Pick<IActionComposerInputProps, 'excludeActionTypes'> {}

export interface IGetAllowedActionBaseParams extends IGetActionBaseParams {
    /**
     * List of allowed actions to transform into action items.
     */
    allowedActions: IAllowedAction[];
}

export interface IGetAllowedActionItemsParams extends IGetAllowedActionBaseParams, Pick<IGetNativeActionItemsParams, 'nativeItems'> {}

export interface IGetDaoActionsParams extends IGetActionBaseParams {
    /**
     * Permissions granted to DAO.
     */
    permissions?: Array<{ permissionId: string; whereAddress: string }>;
}
