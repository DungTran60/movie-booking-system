export interface Cinema {
  id: number
  name: string
  address: string
  city?: string
  status: string
}

export interface Room {
  id: number
  cinemaId: number
  name: string
  totalSeats: number
}

export interface CreateCinemaPayload {
  name: string
  address: string
  city?: string
  status?: string
}

export interface CreateRoomPayload {
  name: string
  totalSeats: number
}

export interface CreateMoviePayload {
  title: string
  slug?: string
  description?: string
  duration: number
  language?: string
  releaseDate?: string
  trailerUrl?: string
  rating?: string
  posterUrl?: string
  status?: string
}
