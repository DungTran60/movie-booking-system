import { useState, useEffect } from 'react'
import api from '@/services/api'
import type { ApiResponse } from '@/types'
import type { Movie } from '@/features/movie/types'
import type { Cinema } from '@/features/admin/types'
import type { Showtime, ShowtimeSeat } from '../types'
import SeatMap from '../components/SeatMap'

export default function ShowtimeSelectionPage() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [cinemas, setCinemas] = useState<Cinema[]>([])

  const [selectedMovieId, setSelectedMovieId] = useState<string>('')
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])

  const [loadingShowtimes, setLoadingShowtimes] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Seat map state
  const [activeShowtime, setActiveShowtime] = useState<Showtime | null>(null)
  const [seats, setSeats] = useState<ShowtimeSeat[]>([])
  const [loadingSeats, setLoadingSeats] = useState<boolean>(false)

  const fetchMetadata = async () => {
    try {
      const [movieRes, cinemaRes] = await Promise.all([
        api.get<ApiResponse<any>>('/v1/movies', { params: { size: 50 } }),
        api.get<ApiResponse<Cinema[]>>('/v1/admin/cinemas'),
      ])
      if (movieRes.data.data?.content) {
        setMovies(movieRes.data.data.content)
      }
      if (cinemaRes.data.data) {
        setCinemas(cinemaRes.data.data)
      }
    } catch (err) {
      console.error('Error fetching metadata:', err)
    }
  }

  const fetchShowtimes = async () => {
    setLoadingShowtimes(true)
    setError(null)
    try {
      const response = await api.get<ApiResponse<Showtime[]>>('/v1/showtimes', {
        params: {
          movieId: selectedMovieId || undefined,
          cinemaId: selectedCinemaId || undefined,
          date: selectedDate || undefined,
        },
      })
      if (response.data.status === 'SUCCESS' && response.data.data) {
        setShowtimes(response.data.data || [])
      } else {
        setError(response.data.message || 'Không thể tải suất chiếu')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải suất chiếu')
    } finally {
      setLoadingShowtimes(false)
    }
  }

  useEffect(() => {
    fetchMetadata()
  }, [])

  useEffect(() => {
    fetchShowtimes()
  }, [selectedMovieId, selectedCinemaId, selectedDate])

  const handleSelectShowtime = async (st: Showtime) => {
    setActiveShowtime(st)
    setLoadingSeats(true)
    try {
      const response = await api.get<ApiResponse<ShowtimeSeat[]>>(`/v1/showtimes/${st.id}/seats`)
      if (response.data.status === 'SUCCESS' && response.data.data) {
        setSeats(response.data.data || [])
      } else {
        setSeats([])
      }
    } catch (err) {
      console.error('Error fetching seats for showtime:', err)
      setSeats([])
    } finally {
      setLoadingSeats(false)
    }
  }

  // Generate 7 upcoming dates for date selector tab
  const dateTabs = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      iso: d.toISOString().split('T')[0],
      display: d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
    }
  })

  return (
    <div className="space-y-8">
      {/* Title Banner */}
      <div className="bg-[#1B2140] border border-[#2A3157] rounded-xl p-6 relative overflow-hidden marquee-glow">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E8A33D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#E8A33D]/10 border border-[#E8A33D]/30 text-[#E8A33D] text-[10px] font-semibold uppercase tracking-widest">
            Đặt Vé Phim Online
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F2EFE6]">
            Chọn Suất Chiếu & Sơ Đồ Ghế
          </h1>
          <p className="text-xs text-[#B7BAC9]">
            Lọc lịch chiếu theo ngày, rạp chiếu phim và xem sơ đồ ghế thời gian thực
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 bg-[#C1443F]/15 border border-[#C1443F]/40 text-[#F2EFE6] text-xs rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-[#C1443F] font-bold">✕</button>
        </div>
      )}

      {/* Date Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-[#2A3157] pb-2">
        {dateTabs.map(tab => (
          <button
            key={tab.iso}
            onClick={() => setSelectedDate(tab.iso)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedDate === tab.iso
                ? 'bg-[#E8A33D] text-[#12172B] shadow-md shadow-[#E8A33D]/20'
                : 'bg-[#1B2140] text-[#B7BAC9] hover:text-[#F2EFE6] border border-[#2A3157]'
            }`}
          >
            {tab.display}
          </button>
        ))}
      </div>

      {/* Select Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#1B2140] p-4 border border-[#2A3157] rounded-xl text-xs">
        <div>
          <label className="block text-[#B7BAC9] mb-1 font-medium">Lọc theo Phim:</label>
          <select
            value={selectedMovieId}
            onChange={e => setSelectedMovieId(e.target.value)}
            className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:outline-none focus:border-[#E8A33D]"
          >
            <option value="">-- Tất cả các Phim --</option>
            {movies.map(m => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[#B7BAC9] mb-1 font-medium">Lọc theo Rạp Chiếu:</label>
          <select
            value={selectedCinemaId}
            onChange={e => setSelectedCinemaId(e.target.value)}
            className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:outline-none focus:border-[#E8A33D]"
          >
            <option value="">-- Tất cả Rạp Chiếu --</option>
            {cinemas.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Showtime List / Slots */}
      {loadingShowtimes ? (
        <div className="py-12 text-center text-[#E8A33D] text-xs uppercase tracking-widest animate-pulse">
          Đang tìm suất chiếu phù hợp...
        </div>
      ) : showtimes.length === 0 ? (
        <div className="p-12 text-center bg-[#1B2140] border border-[#2A3157] rounded-xl space-y-2">
          <h3 className="font-display font-semibold text-[#F2EFE6] text-sm">Không có suất chiếu nào</h3>
          <p className="text-xs text-[#565B72]">Vui lòng thử thay đổi ngày hoặc chọn phim/rạp khác.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="font-display font-bold text-lg text-[#F2EFE6]">
            Suất Chiếu Khả Dụng ({showtimes.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {showtimes.map(st => {
              const isSelected = activeShowtime?.id === st.id
              const startTimeStr = new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              const endTimeStr = new Date(st.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

              return (
                <div
                  key={st.id}
                  onClick={() => handleSelectShowtime(st)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-[#1B2140] border-[#E8A33D] marquee-glow'
                      : 'bg-[#1B2140]/60 border-[#2A3157] hover:border-[#E8A33D]/60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display font-bold text-[#F2EFE6] text-sm">{st.movie?.title || 'Phim'}</h3>
                      <span className="text-[11px] text-[#B7BAC9] block">{st.cinemaName} • {st.room?.name}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-[#0D1120] border border-[#2A3157] text-[#E8A33D] font-mono text-[10px] rounded">
                      {st.movie?.rating || 'P'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#2A3157]/60 text-xs">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="px-2.5 py-1 bg-[#E8A33D] text-[#12172B] font-bold rounded text-xs">
                        {startTimeStr}
                      </span>
                      <span className="text-[#565B72]">~ {endTimeStr}</span>
                    </div>

                    <span className="font-mono font-bold text-[#5FA777]">
                      {Number(st.price).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Selected Showtime Seat Map Display */}
      {activeShowtime && (
        <div className="space-y-4 pt-4 border-t border-[#2A3157]">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-[#F2EFE6]">
              Sơ Đồ Ghế - Suất {new Date(activeShowtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ({activeShowtime.room?.name})
            </h2>
            <button
              onClick={() => setActiveShowtime(null)}
              className="text-xs text-[#B7BAC9] hover:text-[#F2EFE6] cursor-pointer"
            >
              ✕ Đóng sơ đồ
            </button>
          </div>

          {loadingSeats ? (
            <div className="py-12 text-center text-[#E8A33D] text-xs uppercase tracking-widest animate-pulse">
              Đang tải sơ đồ ghế thời gian thực...
            </div>
          ) : (
            <SeatMap seats={seats} />
          )}
        </div>
      )}
    </div>
  )
}
