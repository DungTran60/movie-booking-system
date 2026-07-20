// Global TypeScript types
// Thêm các interface/type dùng chung cho toàn bộ project vào đây

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}
