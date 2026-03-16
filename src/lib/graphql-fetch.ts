import { unstable_cache } from "next/cache";
import { print, type DocumentNode } from "graphql";
import {
  type ApolloQueryResult,
  type OperationVariables,
} from "@apollo/client";
import makeClient from "./apollo-client";
import { MockThemeCustomizationResponse, MockProductsResponse, MockHomeCategoriesResponse, MockProductByUrlKey, MockProductReviews } from "../utils/bagisto/mockData";





export type CacheLifePreset =
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "weeks"
  | "max";

export type CacheLifeOption = number | CacheLifePreset;

export function getRevalidateTime(
  life?: CacheLifeOption
): number | false {
  if (!life) return false;
  if (typeof life === "number") return life;

  switch (life) {
    case "seconds":
      return 10;
    case "minutes":
      return 60;
    case "hours":
      return 3600;
    case "days":
      return 86400;
    case "weeks":
      return 604800;
    case "max":
      return false;
    default:
      return false;
  }
}



const queryPrintMemo = new WeakMap<DocumentNode, string>();

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj)
    .sort()
    .map(
      (key) => `"${key}":${stableStringify(obj[key])}`
    )
    .join(",")}}`;
}




export interface GraphQLRequestOptions {
  tags?: string[];
  life?: CacheLifeOption;
  noCache?: boolean;
  context?: Record<string, unknown>;
  fetchPolicy?:
  | "cache-first"
  | "network-only"
  | "no-cache"
  | "cache-only";
}

export async function graphqlRequest<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables
>(
  query: DocumentNode,
  variables?: TVariables,
  options?: GraphQLRequestOptions
): Promise<TData> {
  const operationDef = (query as any).definitions?.find(
    (def: any) => def.kind === 'OperationDefinition'
  );
  const queryName = operationDef?.name?.value;
  if (queryName === "themeCustomization") {
    return MockThemeCustomizationResponse as unknown as TData;
  }
  if (queryName === "GetProducts") {
    return MockProductsResponse as unknown as TData;
  }
  if (queryName === "Categories") {
    return MockHomeCategoriesResponse as unknown as TData;
  }
  // Product detail page queries — look up by urlKey from variables
  if (queryName === "GetProductById" || queryName === "ProductSwatchReview") {
    const urlKey = (variables as any)?.urlKey as string | undefined;
    const product = urlKey ? MockProductByUrlKey[urlKey] ?? null : null;
    return { product } as unknown as TData;
  }
  if (queryName === "GetRelatedProducts") {
    const urlKey = (variables as any)?.urlKey as string | undefined;
    const product = urlKey ? MockProductByUrlKey[urlKey] ?? null : null;
    return { product } as unknown as TData;
  }
  if (queryName === "GetProductReviews") {
    return MockProductReviews as unknown as TData;
  }

  return {} as TData;
  if (options?.noCache) {
    const client = makeClient();
    const result: ApolloQueryResult<TData> =
      await client.query({
        query,
        variables,
        context: options?.context,
        fetchPolicy: options?.fetchPolicy ?? "no-cache",
      });

    return result.data;
  }

  if (options?.context) {
    throw new Error(
      "graphqlRequest: Caching with `context` is unsafe. Use noCache instead."
    );
  }

  let queryString: string = "";
  const cachedQueryString = queryPrintMemo.get(query);

  if (cachedQueryString) {
    queryString = cachedQueryString as string;
  } else {
    queryString = print(query);
    queryPrintMemo.set(query, queryString);
  }

  const cacheKey = `graphql:${stableStringify({
    query: queryString as string,
    variables,
  })}`;

  const revalidate = getRevalidateTime(options?.life);

  const cachedQuery = unstable_cache(
    async (): Promise<TData> => {
      const client = makeClient();
      const result: ApolloQueryResult<TData> =
        await client.query({
          query,
          variables,
          fetchPolicy: "network-only",
        });

      return result.data;
    },
    [cacheKey],
    {
      tags: options?.tags,
      revalidate,
    }
  );

  return cachedQuery();
}



export async function graphqlRequestNoCache<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables
>(
  query: DocumentNode,
  variables?: TVariables,
  options?: Omit<
    GraphQLRequestOptions,
    "noCache" | "tags" | "life"
  >
): Promise<TData> {
  const operationDef = (query as any).definitions?.find(
    (def: any) => def.kind === 'OperationDefinition'
  );
  const queryName = operationDef?.name?.value;
  if (queryName === "themeCustomization") {
    return MockThemeCustomizationResponse as unknown as TData;
  }
  if (queryName === "GetProducts") {
    return MockProductsResponse as unknown as TData;
  }
  if (queryName === "Categories") {
    return MockHomeCategoriesResponse as unknown as TData;
  }
  if (queryName === "GetProductById" || queryName === "ProductSwatchReview") {
    const urlKey = (variables as any)?.urlKey as string | undefined;
    const product = urlKey ? MockProductByUrlKey[urlKey] ?? null : null;
    return { product } as unknown as TData;
  }
  if (queryName === "GetRelatedProducts") {
    const urlKey = (variables as any)?.urlKey as string | undefined;
    const product = urlKey ? MockProductByUrlKey[urlKey] ?? null : null;
    return { product } as unknown as TData;
  }
  if (queryName === "GetProductReviews") {
    return MockProductReviews as unknown as TData;
  }

  return {} as TData;
  return graphqlRequest<TData, TVariables>(
    query,
    variables,
    {
      ...options,
      noCache: true,
    }
  );
}
