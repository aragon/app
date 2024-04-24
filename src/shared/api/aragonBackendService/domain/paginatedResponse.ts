export interface IPaginatedResponse<TData> {
    limit: number;
    skip: number;
    data: TData[];
    totRecords: number;
}
