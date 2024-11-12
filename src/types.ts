export interface PathParamsWithId {
  id: string;
}

export interface PaginationQueryParams {
  cursor?: string;
  pageSize?: string;
}

export interface PaginatedRequestArgs {
  cursor?: string;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  status: "success" | "error";
  isLastPage: boolean;
  data: T[];
  cursor?: string;
}

export interface APIResponse<T> {
  status: "success" | "error";
  data: T | null;
  message?: string;
}
