# Data Fetching

This documentation outlines the data fetching process for the Aragon application. All data fetching and interactions
with third-party dependencies must be done through [React Query](https://tanstack.com/query).

## Process

Data fetching occurs in two places:

1. **Server Component**: In this case, the data must be prefetched using the `prefetchQuery` or `prefetchInfiniteQuery`
   React Query utilities. This ensures that the data is available when requested by client components.

    Example:

    ```typescript
    // ExploreDaos.tsx

    const queryClient = new QueryClient();

    const daoListQueryParams = { limit: 20, skip: 0 };
    await queryClient.prefetchInfiniteQuery(daoListOptions({ queryParams: daoListQueryParams }));
    ```

2. **Client Component**: These components directly use the queries/mutations defined under the service query/mutation
   folders.

    Example:

    ```typescript
    // DaoList.tsx

    const daoListQueryParams = { limit: 20, skip: 0 };
    const { data: daoListData } = useDaoList({ queryParams: daoListQueryParams });
    ```

**⚠️ NOTE**: Make sure not to use the fetched data on Server components as React Query has no idea on how to revalidate
a Server component, more info
[here](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr#data-ownership-and-revalidation).

## Folder Structure

To introduce a new service, follow these guidelines:

- **Module-specific Service**: If the data being fetched is specific to a module, create a new folder under the `api`
  folder of the relative module.

    Example path: `/dashboard/api/exampleService`

- **Shared Service**: If the service is reused by different modules/plugins, create a new folder under the `shared`
  folder.

    Example path: `/shared/api/exampleService`

Each service folder should contain the following files and folders:

- `/exampleService.ts`: This file should export a TypeScript class responsible for making requests to the third-party
  service.
- `/exampleService.api.ts`: This file includes the parameters that each request needs.
- `/exampleServiceKeys.ts`: This file includes the React Query query keys used to cache the requests.
- `/domain`: The domain folder includes all type definitions for this service.
- `/queries`: The queries folder includes all React Query queries.
- `/mutations`: The mutations folder includes all React Query mutations.
