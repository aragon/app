/**
 * Search parameters of a page, as Next hands them to it: a parameter may be absent, a string, or an array when the
 * URL repeats it.
 *
 * Declared here because Next exports no type for this shape. Its generated `PageProps` helper, which would cover
 * the route parameters and these together, only exists with `typedRoutes` enabled, and the app does not set it.
 */
export interface IPageSearchParams {
    [key: string]: string | string[] | undefined;
}
