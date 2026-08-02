import { useState, useEffect } from 'react'
import api from '@/services/api'
import type { ApiResponse } from '@/types'
import type { Movie, MoviePageResponse } from '@/features/movie/types'
import type { CreateMoviePayload } from '@/features/admin/types'

export default function AdminMovieManager() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [search, setSearch] = useState<string>('')
  const [searchInput, setSearchInput] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [deletingMovie, setDeletingMovie] = useState<Movie | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Form states
  const [title, setTitle] = useState<string>('')
  const [slug, setSlug] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [duration, setDuration] = useState<number>(120)
  const [language, setLanguage] = useState<string>('Tiếng Việt')
  const [releaseDate, setReleaseDate] = useState<string>('')
  const [posterUrl, setPosterUrl] = useState<string>('')
  const [trailerUrl, setTrailerUrl] = useState<string>('')
  const [rating, setRating] = useState<string>('T18')
  const [status, setStatus] = useState<string>('NOW_SHOWING')

  const fetchMovies = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<ApiResponse<MoviePageResponse>>('/v1/movies', {
        params: {
          page,
          size: 6,
          search: search || undefined,
          sort: 'createdAt,desc',
        },
      })
      const envelope = response.data
      if (envelope.status === 'SUCCESS' && envelope.data) {
        setMovies(envelope.data.content || [])
        setTotalPages(envelope.data.totalPages || 1)
      } else {
        setError(envelope.message || 'Không thể tải danh sách phim')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải phim')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovies()
  }, [page, search])

  const handleOpenAddModal = () => {
    setEditingMovie(null)
    setTitle('')
    setSlug('')
    setDescription('')
    setDuration(120)
    setLanguage('Tiếng Việt')
    setReleaseDate(new Date().toISOString().split('T')[0])
    setPosterUrl('')
    setTrailerUrl('')
    setRating('T18')
    setStatus('NOW_SHOWING')
    setShowModal(true)
  }

  const handleOpenEditModal = (movie: Movie) => {
    setEditingMovie(movie)
    setTitle(movie.title || '')
    setSlug(movie.slug || '')
    setDescription('')
    setDuration(movie.duration || 120)
    setLanguage(movie.language || 'Tiếng Việt')
    setReleaseDate(movie.releaseDate || '')
    setPosterUrl(movie.posterUrl || '')
    setTrailerUrl('')
    setRating(movie.rating || 'T18')
    setStatus(movie.status || 'NOW_SHOWING')

    // Fetch detail to get description and trailerUrl
    api.get<ApiResponse<any>>(`/v1/movies/${movie.slug}`).then(res => {
      if (res.data.status === 'SUCCESS' && res.data.data) {
        const detail = res.data.data
        setDescription(detail.description || '')
        setTrailerUrl(detail.trailerUrl || '')
      }
    })

    setShowModal(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || duration <= 0) {
      setError('Vui lòng nhập đầy đủ tiêu đề và thời lượng hợp lệ')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    const payload: CreateMoviePayload = {
      title,
      slug: slug || undefined,
      description,
      duration: Number(duration),
      language,
      releaseDate: releaseDate || undefined,
      posterUrl,
      trailerUrl,
      rating,
      status,
    }

    try {
      if (editingMovie) {
        await api.put(`/v1/admin/movies/${editingMovie.id}`, payload)
        setSuccessMsg('Cập nhật thông tin phim thành công!')
      } else {
        await api.post('/v1/admin/movies', payload)
        setSuccessMsg('Tạo phim mới thành công!')
      }
      setShowModal(false)
      fetchMovies()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể lưu thông tin phim')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmSoftDelete = async () => {
    if (!deletingMovie) return
    setSubmitting(true)
    setError(null)
    try {
      await api.delete(`/v1/admin/movies/${deletingMovie.id}`)
      setSuccessMsg(`Đã chuyển phim "${deletingMovie.title}" sang trạng thái xóa (Soft Delete).`)
      setDeletingMovie(null)
      fetchMovies()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể xóa phim')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1B2140] p-5 rounded-xl border border-[#2A3157]">
        <div>
          <h2 className="font-display text-xl font-bold text-[#F2EFE6]">🎬 Quản Lý Danh Sách Phim</h2>
          <p className="text-xs text-[#B7BAC9] mt-0.5">Thêm mới, chỉnh sửa thông tin phim và soft-delete</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-[#E8A33D] hover:bg-[#F2B655] text-[#12172B] font-semibold text-xs px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#E8A33D]/10"
        >
          <span>➕</span> Thêm Phim Mới
        </button>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-3.5 bg-[#5FA777]/15 border border-[#5FA777]/40 text-[#F2EFE6] text-xs rounded-lg flex items-center justify-between">
          <span>🎉 {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-[#5FA777] font-bold">✕</button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-[#C1443F]/15 border border-[#C1443F]/40 text-[#F2EFE6] text-xs rounded-lg flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-[#C1443F] font-bold">✕</button>
        </div>
      )}

      {/* Search Bar */}
      <form
        onSubmit={e => {
          e.preventDefault()
          setPage(0)
          setSearch(searchInput.trim())
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Tìm theo tên phim..."
          className="flex-1 bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] placeholder-[#565B72] text-xs px-3.5 py-2 rounded-lg focus:outline-none focus:border-[#E8A33D]"
        />
        <button
          type="submit"
          className="bg-[#1B2140] hover:border-[#E8A33D] border border-[#2A3157] text-[#F2EFE6] text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          Tìm
        </button>
      </form>

      {/* Movie List Table */}
      {loading ? (
        <div className="py-12 text-center text-[#E8A33D] text-xs uppercase tracking-widest animate-pulse">
          ⏳ Đang tải danh sách phim...
        </div>
      ) : (
        <div className="bg-[#1B2140] border border-[#2A3157] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#B7BAC9]">
              <thead className="bg-[#0D1120] text-[#F2EFE6] uppercase text-[10px] tracking-wider border-b border-[#2A3157]">
                <tr>
                  <th className="p-3.5">Poster</th>
                  <th className="p-3.5">Tên phim</th>
                  <th className="p-3.5">Thời lượng</th>
                  <th className="p-3.5">Khởi chiếu</th>
                  <th className="p-3.5">Độ tuổi</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3157]/60">
                {movies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#565B72]">
                      Không có phim nào được tìm thấy.
                    </td>
                  </tr>
                ) : (
                  movies.map(movie => (
                    <tr key={movie.id} className="hover:bg-[#0D1120]/50 transition-colors">
                      <td className="p-3.5">
                        <div className="w-10 h-14 bg-[#0D1120] rounded border border-[#2A3157] overflow-hidden">
                          {movie.posterUrl ? (
                            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs">🎬</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-display font-medium text-[#F2EFE6] block">{movie.title}</span>
                        <span className="text-[10px] text-[#565B72]">/{movie.slug}</span>
                      </td>
                      <td className="p-3.5">{movie.duration} phút</td>
                      <td className="p-3.5">{movie.releaseDate || '—'}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-[#0D1120] border border-[#2A3157] text-[#E8A33D] font-mono text-[10px] rounded">
                          {movie.rating || 'P'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            movie.status === 'NOW_SHOWING'
                              ? 'bg-[#E8A33D]/20 text-[#E8A33D] border border-[#E8A33D]/40'
                              : movie.status === 'DELETED'
                              ? 'bg-[#C1443F]/20 text-[#C1443F] border border-[#C1443F]/40'
                              : 'bg-[#565B72]/20 text-[#B7BAC9] border border-[#565B72]/40'
                          }`}
                        >
                          {movie.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(movie)}
                          className="bg-[#0D1120] hover:border-[#E8A33D] border border-[#2A3157] text-[#E8A33D] px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => setDeletingMovie(movie)}
                          className="bg-[#8C2F3A]/20 hover:bg-[#8C2F3A] border border-[#8C2F3A]/50 text-[#F2EFE6] px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          🗑️ Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3.5 bg-[#0D1120] border-t border-[#2A3157] flex items-center justify-between text-xs">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(p - 1, 0))}
                className="px-3 py-1.5 bg-[#1B2140] border border-[#2A3157] rounded text-[#F2EFE6] disabled:opacity-40 cursor-pointer"
              >
                ← Trước
              </button>
              <span className="font-mono text-[#E8A33D]">Trang {page + 1} / {totalPages}</span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
                className="px-3 py-1.5 bg-[#1B2140] border border-[#2A3157] rounded text-[#F2EFE6] disabled:opacity-40 cursor-pointer"
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#12172B]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1B2140] border border-[#2A3157] rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto marquee-glow relative">
            <div className="flex items-center justify-between border-b border-[#2A3157] pb-3">
              <h3 className="font-display font-bold text-lg text-[#F2EFE6]">
                {editingMovie ? '✏️ Cập Nhật Phim' : '🎬 Thêm Phim Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#B7BAC9] hover:text-[#F2EFE6]">✕</button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#B7BAC9] mb-1 font-medium">Tên phim *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ví dụ: Avengers: Endgame"
                  className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#B7BAC9] mb-1 font-medium">Thời lượng (phút) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#B7BAC9] mb-1 font-medium">Phân loại tuổi</label>
                  <select
                    value={rating}
                    onChange={e => setRating(e.target.value)}
                    className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                  >
                    <option value="P">P - Phổ biến</option>
                    <option value="K">K - Dưới 13 tuổi</option>
                    <option value="T13">T13 - Trên 13 tuổi</option>
                    <option value="T16">T16 - Trên 16 tuổi</option>
                    <option value="T18">T18 - Trên 18 tuổi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#B7BAC9] mb-1 font-medium">Ngôn ngữ</label>
                  <input
                    type="text"
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    placeholder="Tiếng Việt / Phụ đề"
                    className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#B7BAC9] mb-1 font-medium">Trạng thái</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                  >
                    <option value="NOW_SHOWING">NOW_SHOWING (Đang chiếu)</option>
                    <option value="COMING">COMING (Sắp chiếu)</option>
                    <option value="ENDED">ENDED (Đã kết thúc)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#B7BAC9] mb-1 font-medium">Ngày khởi chiếu</label>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={e => setReleaseDate(e.target.value)}
                  className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#B7BAC9] mb-1 font-medium">URL Ảnh Poster</label>
                <input
                  type="text"
                  value={posterUrl}
                  onChange={e => setPosterUrl(e.target.value)}
                  placeholder="https://example.com/poster.jpg"
                  className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#B7BAC9] mb-1 font-medium">URL Trailer (Youtube)</label>
                <input
                  type="text"
                  value={trailerUrl}
                  onChange={e => setTrailerUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#B7BAC9] mb-1 font-medium">Mô tả nội dung phim</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Nhập tóm tắt nội dung..."
                  className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
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
                  {submitting ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMovie && (
        <div className="fixed inset-0 z-50 bg-[#12172B]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1B2140] border border-[#2A3157] rounded-xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="text-4xl">⚠️</div>
            <h3 className="font-display font-bold text-base text-[#F2EFE6]">Xác Nhận Xóa Mềm Phim</h3>
            <p className="text-xs text-[#B7BAC9]">
              Bạn có chắc chắn muốn xóa phim <span className="text-[#E8A33D] font-semibold">"{deletingMovie.title}"</span>? Trạng thái sẽ được đổi thành <span className="font-mono text-[#C1443F]">DELETED</span>.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingMovie(null)}
                className="bg-[#0D1120] text-[#B7BAC9] border border-[#2A3157] px-4 py-2 rounded-lg text-xs cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmSoftDelete}
                disabled={submitting}
                className="bg-[#8C2F3A] hover:bg-[#A63530] text-[#F2EFE6] font-semibold px-4 py-2 rounded-lg text-xs cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Đang Xóa...' : 'Xác Nhận Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
