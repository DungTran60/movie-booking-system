import { useState, useEffect } from 'react'
import api from '@/services/api'
import type { ApiResponse } from '@/types'
import type { Movie } from '@/features/movie/types'
import type { Cinema, Room } from '@/features/admin/types'
import type { Showtime, CreateShowtimePayload } from '@/features/showtime/types'

export default function AdminShowtimeManager() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [cinemas, setCinemas] = useState<Cinema[]>([])
  const [rooms, setRooms] = useState<Room[]>([])

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [overlapError, setOverlapError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Filters
  const [filterMovieId, setFilterMovieId] = useState<string>('')
  const [filterCinemaId, setFilterCinemaId] = useState<string>('')

  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Form states
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null)
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')
  const [price, setPrice] = useState<number>(100000)

  const fetchShowtimes = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<ApiResponse<Showtime[]>>('/v1/showtimes', {
        params: {
          movieId: filterMovieId || undefined,
          cinemaId: filterCinemaId || undefined,
        },
      })
      if (response.data.status === 'SUCCESS' && response.data.data) {
        setShowtimes(response.data.data || [])
      } else {
        setError(response.data.message || 'Không thể tải danh sách suất chiếu')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách suất chiếu')
    } finally {
      setLoading(false)
    }
  }

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
      console.error('Error fetching metadata for showtimes:', err)
    }
  }

  useEffect(() => {
    fetchMetadata()
  }, [])

  useEffect(() => {
    fetchShowtimes()
  }, [filterMovieId, filterCinemaId])

  useEffect(() => {
    if (selectedCinemaId) {
      api.get<ApiResponse<Room[]>>(`/v1/admin/cinemas/${selectedCinemaId}/rooms`).then(res => {
        if (res.data.data) {
          setRooms(res.data.data)
          if (res.data.data.length > 0) {
            setSelectedRoomId(res.data.data[0].id)
          } else {
            setSelectedRoomId(null)
          }
        }
      })
    } else {
      setRooms([])
      setSelectedRoomId(null)
    }
  }, [selectedCinemaId])

  const handleOpenAddModal = () => {
    setOverlapError(null)
    setError(null)
    if (movies.length > 0) setSelectedMovieId(movies[0].id)
    if (cinemas.length > 0) setSelectedCinemaId(cinemas[0].id)

    const now = new Date()
    now.setHours(now.getHours() + 1, 0, 0, 0)
    const startStr = now.toISOString().slice(0, 16)

    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    const endStr = end.toISOString().slice(0, 16)

    setStartTime(startStr)
    setEndTime(endStr)
    setPrice(100000)
    setShowModal(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMovieId || !selectedRoomId || !startTime || !endTime || price <= 0) {
      setError('Vui lòng chọn phim, phòng chiếu, thời gian bắt đầu/kết thúc và giá vé hợp lệ')
      return
    }

    setSubmitting(true)
    setError(null)
    setOverlapError(null)
    setSuccessMsg(null)

    const payload: CreateShowtimePayload = {
      movieId: selectedMovieId,
      roomId: selectedRoomId,
      startTime,
      endTime,
      price: Number(price),
    }

    try {
      const response = await api.post<ApiResponse<Showtime>>('/v1/admin/showtimes', payload)
      if (response.data.status === 'SUCCESS') {
        setSuccessMsg('Tạo suất chiếu mới thành công!')
        setShowModal(false)
        fetchShowtimes()
      } else {
        setError(response.data.message || 'Không thể tạo suất chiếu')
      }
    } catch (err: any) {
      const status = err.response?.status
      const errorCode = err.response?.data?.status || err.response?.data?.errorCode

      if (status === 409 || errorCode === 'SHOWTIME_OVERLAP') {
        setOverlapError(
          'LỖI TRÙNG LỊCH (SHOWTIME_OVERLAP): Khung giờ này bị trùng với một suất chiếu khác trong cùng phòng chiếu! Vui lòng chọn khung giờ hoặc phòng chiếu khác.'
        )
      } else {
        setError(err.response?.data?.message || 'Không thể tạo suất chiếu')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1B2140] p-5 rounded-xl border border-[#2A3157]">
        <div>
          <h2 className="font-display text-xl font-bold text-[#F2EFE6]">Quản Lý Suất Chiếu</h2>
          <p className="text-xs text-[#B7BAC9] mt-0.5">Lên lịch chiếu phim, giá vé và kiểm tra tự động trùng lịch phòng (BR-05)</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-[#E8A33D] hover:bg-[#F2B655] text-[#12172B] font-semibold text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow-md shadow-[#E8A33D]/10"
        >
          Tạo Suất Chiếu Mới
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-3.5 bg-[#5FA777]/15 border border-[#5FA777]/40 text-[#F2EFE6] text-xs rounded-lg flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-[#5FA777] font-bold">✕</button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-[#C1443F]/15 border border-[#C1443F]/40 text-[#F2EFE6] text-xs rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-[#C1443F] font-bold">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-[#0D1120] p-3.5 border border-[#2A3157] rounded-xl text-xs">
        <span className="text-[#B7BAC9] font-medium">Bộ Lọc:</span>

        <select
          value={filterMovieId}
          onChange={e => setFilterMovieId(e.target.value)}
          className="bg-[#1B2140] border border-[#2A3157] text-[#F2EFE6] px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#E8A33D]"
        >
          <option value="">-- Tất cả Phim --</option>
          {movies.map(m => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>

        <select
          value={filterCinemaId}
          onChange={e => setFilterCinemaId(e.target.value)}
          className="bg-[#1B2140] border border-[#2A3157] text-[#F2EFE6] px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#E8A33D]"
        >
          <option value="">-- Tất cả Rạp --</option>
          {cinemas.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {(filterMovieId || filterCinemaId) && (
          <button
            onClick={() => {
              setFilterMovieId('')
              setFilterCinemaId('')
            }}
            className="text-[#E8A33D] hover:underline cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Showtime Table */}
      {loading ? (
        <div className="py-12 text-center text-[#E8A33D] text-xs uppercase tracking-widest animate-pulse">
          Đang tải danh sách suất chiếu...
        </div>
      ) : (
        <div className="bg-[#1B2140] border border-[#2A3157] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#B7BAC9]">
              <thead className="bg-[#0D1120] text-[#F2EFE6] uppercase text-[10px] tracking-wider border-b border-[#2A3157]">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Tên Phim</th>
                  <th className="p-3.5">Rạp & Phòng Chiếu</th>
                  <th className="p-3.5">Thời Gian Bắt Đầu</th>
                  <th className="p-3.5">Thời Gian Kết Thúc</th>
                  <th className="p-3.5">Giá Vé Chuẩn</th>
                  <th className="p-3.5">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3157]/60">
                {showtimes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#565B72]">
                      Chưa có suất chiếu nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  showtimes.map(st => (
                    <tr key={st.id} className="hover:bg-[#0D1120]/50 transition-colors">
                      <td className="p-3.5 font-mono text-[#E8A33D]">#{st.id}</td>
                      <td className="p-3.5 font-display font-semibold text-[#F2EFE6]">
                        {st.movie?.title || 'Phim #' + st.id}
                      </td>
                      <td className="p-3.5">
                        <span className="text-[#F2EFE6] block font-medium">{st.cinemaName || 'Rạp'}</span>
                        <span className="text-[10px] text-[#565B72]">{st.room?.name || 'Phòng'}</span>
                      </td>
                      <td className="p-3.5 font-mono text-[#E8A33D]">
                        {new Date(st.startTime).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-3.5 font-mono text-[#B7BAC9]">
                        {new Date(st.endTime).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-[#5FA777]">
                        {Number(st.price).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-[#5FA777]/20 text-[#5FA777] border border-[#5FA777]/40 text-[10px] font-bold rounded uppercase">
                          {st.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Showtime Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#12172B]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1B2140] border border-[#2A3157] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative marquee-glow">
            <div className="flex items-center justify-between border-b border-[#2A3157] pb-3">
              <h3 className="font-display font-bold text-lg text-[#F2EFE6]">
                Tạo Suất Chiếu Mới
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#B7BAC9] hover:text-[#F2EFE6] cursor-pointer">✕</button>
            </div>

            {/* SHOWTIME OVERLAP Banner */}
            {overlapError && (
              <div className="p-4 bg-[#8C2F3A]/30 border-2 border-[#8C2F3A] text-[#F2EFE6] text-xs rounded-xl space-y-1">
                <div className="font-bold text-sm text-[#F2EFE6] flex items-center gap-1.5">
                  TRÙNG LỊCH CHIẾU (BR-05)
                </div>
                <p className="text-[11px] leading-relaxed text-[#F2EFE6]">
                  {overlapError}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#B7BAC9] mb-1 font-medium">Chọn Phim *</label>
                <select
                  required
                  value={selectedMovieId || ''}
                  onChange={e => setSelectedMovieId(Number(e.target.value))}
                  className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                >
                  {movies.map(m => (
                    <option key={m.id} value={m.id}>{m.title} ({m.duration} phút)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#B7BAC9] mb-1 font-medium">Chọn Rạp *</label>
                  <select
                    required
                    value={selectedCinemaId || ''}
                    onChange={e => setSelectedCinemaId(Number(e.target.value))}
                    className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                  >
                    {cinemas.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#B7BAC9] mb-1 font-medium">Chọn Phòng Chiếu *</label>
                  <select
                    required
                    value={selectedRoomId || ''}
                    onChange={e => setSelectedRoomId(Number(e.target.value))}
                    className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                  >
                    {rooms.length === 0 ? (
                      <option value="">(Rạp chưa có phòng)</option>
                    ) : (
                      rooms.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.totalSeats} ghế)</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#B7BAC9] mb-1 font-medium">Thời gian Bắt đầu *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#B7BAC9] mb-1 font-medium">Thời gian Kết thúc *</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#B7BAC9] mb-1 font-medium">Giá vé chuẩn (VNĐ) *</label>
                <input
                  type="number"
                  required
                  min={10000}
                  step={5000}
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 border-t border-[#2A3157] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-[#0D1120] text-[#B7BAC9] border border-[#2A3157] px-4 py-2 rounded-lg hover:text-[#F2EFE6] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#E8A33D] hover:bg-[#F2B655] text-[#12172B] font-semibold px-5 py-2 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Đang Kiểm Tra & Lưu...' : 'Lưu Suất Chiếu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
