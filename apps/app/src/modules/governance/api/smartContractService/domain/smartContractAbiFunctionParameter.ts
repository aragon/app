export interface ISmartContractAbiFunctionParameter {
    /**
     * Name of the parameter.
     */
    name: string;
    /**
     * Type of the parameter.
     */
    type: string;
    /**
     * NatSpec comment of the parameter.
     */
    notice?: string;
    /**
     * Components of the parameter for tuple or typle[] types.
     */
    components?: ISmartContractAbiFunctionParameter[];
}
