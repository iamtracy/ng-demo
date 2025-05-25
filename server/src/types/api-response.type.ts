export interface ApiResponse<T> {
  data: T
  message: string
  status: number
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type ApiErrorResponse = ApiResponse<null> & {
  error: string
  statusCode: number
}
