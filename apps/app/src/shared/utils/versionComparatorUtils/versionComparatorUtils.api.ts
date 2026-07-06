export interface IVersion<TType extends number | string = number> {
    /**
     * Release number of the version.
     */
    release: TType;
    /**
     * Build number of the version.
     */
    build: TType;
    /**
     * Patch number of the version.
     */
    patch?: TType;
}

export type ComparatorInput = IVersion | IVersion<string> | string | undefined;

export type ComparatorArgs = [ComparatorInput, ComparatorInput];
