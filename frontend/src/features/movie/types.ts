export interface Genre {
  id: number
  name: string
  slug: string
}

export interface Movie {
  id: number
  title: string
  slug: string
  duration: number
  language?: string
  releaseDate?: string
  posterUrl?: string
  rating?: string
  status: string
  genres?: Genre[]
}

export interface MovieDetail extends Movie {
  description?: string
  trailerUrl?: string
}

export interface MoviePageResponse {
  content: Movie[]
  totalElements: number
  totalPages: number
  pageNumber: number
  pageSize: number
}
