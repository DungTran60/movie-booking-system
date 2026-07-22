// Global TypeScript types
// Thêm các interface/type dùng chung cho toàn bộ project vào đây

export interface ValidationError {
  field: string
  message: string
}

export interface ApiResponse<T> {
  status: 'SUCCESS' | 'ERROR'
  code: string
  message: string
  data?: T
  errors?: ValidationError[]
  timestamp: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}
