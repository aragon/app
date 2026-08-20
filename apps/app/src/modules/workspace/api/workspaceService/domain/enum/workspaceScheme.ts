/**
 * Access-control schemes a contract can advertise. A contract can hold several at once, e.g.
 * Ownable and AccessControl are not exclusive.
 */
export enum WorkspaceScheme {
    OWNABLE = 'ownable',
    OWNABLE_2_STEP = 'ownable2Step',
    ACCESS_CONTROL = 'accessControl',
    ACCESS_CONTROL_ENUMERABLE = 'accessControlEnumerable',
    ACCESS_MANAGED = 'accessManaged',
}
