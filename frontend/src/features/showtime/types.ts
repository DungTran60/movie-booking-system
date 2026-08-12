export interface Showtime {
  id: number
  movie: {
    id: number
    title: string
    posterUrl?: string
    duration?: number
    rating?: string
  }
  room: {
    id: number
    name: string
  }
  cinemaId: number
  cinemaName: string
  startTime: string
  endTime: string
  price: number
  status: string
}

export interface ShowtimeSeat {
  id: number
  seatId: number
  rowCode: string
  seatNumber: number
  seatType: string // STANDARD, VIP, COUPLE
  price: number
  status: string // AVAILABLE, LOCKED, BOOKED
}

export interface CreateShowtimePayload {
  movieId: number
  roomId: number
  startTime: string
  endTime: string
  price: number
}

export interface GenerateSeatsPayload {
  rowCount: number
  colsPerRow: number
  vipRowStart?: number
  vipRowEnd?: number
  coupleRowLast?: boolean
}
