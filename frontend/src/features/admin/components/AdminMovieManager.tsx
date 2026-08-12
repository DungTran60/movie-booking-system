import { useState, useEffect } from 'react'
import api from '@/services/api'
import type { ApiResponse, PaginatedResponse } from '@/types'
import type { Movie, Genre } from '@/features/movie/types'
import type { CreateMoviePayload } from '../types'

export default function AdminMovieManager() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [page, setPage] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [search, setSearch] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [deletingMovie, setDeletingMovie] = useState<Movie | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)

  // TMDB Import state
  const [tmdbId, setTmdbId] = useState<string>('')
  const [importingTmdb, setImportingTmdb] = useState<boolean>(false)

  // Form states
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [duration, setDuration] = useState<number>(120)
  const [language, setLanguage] = useState<string>('Tiếng Việt')
  const [releaseDate, setReleaseDate] = useState<string>('')
  const [trailerUrl, setTrailerUrl] = useState<string>('')
  const [rating, setRating] = useState<string>('P')
  const [posterUrl, setPosterUrl] = useState<string>('')
  const [status, setStatus] = useState<string>('NOW_SHOWING')
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([])

  const fetchMovies = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Movie>>>('/v1/admin/movies', {
        params: {
          page,
          size: 8,
          search: search || undefined,
        },
      })
      if (response.data.status === 'SUCCESS' && response.data.data) {
        setMovies(response.data.data.content || [])
        setTotalPages(response.data.data.totalPages || 1)
      } else {
        setError(response.data.message || 'Không thể tải danh sách phim')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách phim')
    } finally {
      setLoading(false)
    }
  }

  const fetchGenres = async () => {
    try {
      const response = await api.get<ApiResponse<Genre[]>>('/v1/genres')
      if (response.data.status === 'SUCCESS' && response.data.data) {
        setGenres(response.data.data)
      }
    } catch (err) {
      console.error('Error fetching genres:', err)
    }
  }

  useEffect(() => {
    fetchGenres()
  }, [])

  useEffect(() => {
    fetchMovies()
  }, [page, search])

  const handleOpenAddModal = () => {
    setEditingMovie(null)
    setTitle('')
    setDescription('')
    setDuration(120)
    setLanguage('Tiếng Việt')
    setReleaseDate(new Date().toISOString().split('T')[0])
    setTrailerUrl('')
    setRating('P')
    setPosterUrl('')
    setStatus('NOW_SHOWING')
    setSelectedGenreIds([])
    setShowModal(true)
  }

  const handleOpenEditModal = (movie: Movie) => {
    setEditingMovie(movie)
    setTitle(movie.title)
    setDescription('')
    setDuration(movie.duration)
    setLanguage(movie.language || 'Tiếng Việt')
    setReleaseDate(movie.releaseDate || '')
    setTrailerUrl('')
    setRating(movie.rating || 'P')
    setPosterUrl(movie.posterUrl || '')
    setStatus(movie.status)
    setSelectedGenreIds(movie.genres ? movie.genres.map((g: Genre) => g.id) : [])
    setShowModal(true)
  }

  const handleToggleGenre = (genreId: number) => {
    if (selectedGenreIds.includes(genreId)) {
      setSelectedGenreIds(selectedGenreIds.filter(id => id !== genreId))
    } else {
      setSelectedGenreIds([...selectedGenreIds, genreId])
    }
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || duration <= 0) {
      setError('Vui lòng nhập tên phim và thời lượng hợp lệ')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    const payload: CreateMoviePayload = {
      title,
      description,
      duration: Number(duration),
      language,
      releaseDate: releaseDate || undefined,
      trailerUrl,
      rating,
      posterUrl,
      status,
    }

    try {
      if (editingMovie) {
        const response = await api.put<ApiResponse<Movie>>(`/v1/admin/movies/${editingMovie.id}`, payload)
        if (response.data.status === 'SUCCESS') {
          setSuccessMsg(`Cập nhật phim "${title}" thành công!`)
          setShowModal(false)
          fetchMovies()
        } else {
          setError(response.data.message || 'Không thể cập nhật phim')
        }
      } else {
        const response = await api.post<ApiResponse<Movie>>('/v1/admin/movies', payload)
        if (response.data.status === 'SUCCESS') {
          setSuccessMsg(`Thêm phim mới "${title}" thành công!`)
          setShowModal(false)
          fetchMovies()
        } else {
          setError(response.data.message || 'Không thể thêm phim mới')
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu phim')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingMovie) return

    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const response = await api.delete<ApiResponse<void>>(`/v1/admin/movies/${deletingMovie.id}`)
      if (response.data.status === 'SUCCESS') {
        setSuccessMsg(`Đã xóa mềm phim "${deletingMovie.title}" thành công.`)
        setDeletingMovie(null)
        fetchMovies()
      } else {
        setError(response.data.message || 'Không thể xóa phim')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa phim')
    } finally {
      setSubmitting(false)
    }
  }

  const handleImportTmdb = async () => {
    if (!tmdbId.trim()) return
    setImportingTmdb(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const response = await api.post<ApiResponse<any>>(`/v1/admin/movies/import/tmdb/${tmdbId.trim()}`)
      if (response.data.status === 'SUCCESS') {
        setSuccessMsg(`Đã đồng bộ phim từ TMDB: ${response.data.data?.title || tmdbId}`)
        setTmdbId('')
        fetchMovies()
      } else {
        setError(response.data.message || 'Không thể import từ TMDB')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi đồng bộ từ TMDB')
    } finally {
      setImportingTmdb(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1B2140] p-5 rounded-xl border border-[#2A3157]">
        <div>
          <h2 className="font-display text-xl font-bold text-[#F2EFE6]">Quản Lý Danh Sách Phim</h2>
          <p className="text-xs text-[#B7BAC9] mt-0.5">Thêm mới, chỉnh sửa, xóa mềm và đồng bộ dữ liệu TMDB</p>
        </div>

        <div className="flex items-center gap-3">
          {/* TMDB Quick Import Input */}
          <div className="flex items-center gap-1.5 bg-[#0D1120] border border-[#2A3157] rounded-lg p-1">
            <input
              type="text"
              placeholder="TMDB ID (VD: 550)"
              value={tmdbId}
              onChange={e => setTmdbId(e.target.value)}
              className="bg-transparent text-xs text-[#F2EFE6] px-2 py-1 focus:outline-none w-28"
            />
            <button
              onClick={handleImportTmdb}
              disabled={importingTmdb || !tmdbId.trim()}
              className="bg-[#0D1120] hover:bg-[#1B2140] text-[#E8A33D] border border-[#E8A33D]/40 text-xs font-semibold px-2.5 py-1 rounded transition-colors disabled:opacity-50 cursor-pointer"
            >
              {importingTmdb ? 'Import...' : 'TMDB Import'}
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-[#E8A33D] hover:bg-[#F2B655] text-[#12172B] font-semibold text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow-md shadow-[#E8A33D]/10"
          >
            Thêm Phim Mới
          </button>
        </div>
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

      {/* Search Bar */}
      <div className="bg-[#0D1120] p-3 border border-[#2A3157] rounded-xl flex items-center gap-3">
        <input
          type="text"
          placeholder="Tìm kiếm phim theo tên..."
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setPage(0)
          }}
          className="bg-transparent border-none text-xs text-[#F2EFE6] placeholder-[#565B72] focus:outline-none w-full px-2"
        />
      </div>

      {/* Movie Table */}
      {loading ? (
        <div className="py-12 text-center text-[#E8A33D] text-xs uppercase tracking-widest animate-pulse">
          Đang tải danh sách phim...
        </div>
      ) : (
        <div className="bg-[#1B2140] border border-[#2A3157] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#B7BAC9]">
              <thead className="bg-[#0D1120] text-[#F2EFE6] uppercase text-[10px] tracking-wider border-b border-[#2A3157]">
                <tr>
                  <th className="p-3.5">Poster</th>
                  <th className="p-3.5">Tên Phim</th>
                  <th className="p-3.5">Thể Loại</th>
                  <th className="p-3.5">Thời Lượng</th>
                  <th className="p-3.5">Phân Loại</th>
                  <th className="p-3.5">Trạng Thái</th>
                  <th className="p-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3157]/60">
                {movies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#565B72]">
                      Không tìm thấy phim nào.
                    </td>
                  </tr>
                ) : (
                  movies.map(movie => (
                    <tr key={movie.id} className="hover:bg-[#0D1120]/50 transition-colors">
                      <td className="p-3.5">
                        <div className="w-10 h-14 rounded overflow-hidden bg-[#0D1120] border border-[#2A3157] shrink-0">
                          {movie.posterUrl ? (
                            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-[#565B72]">Phim</div>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 font-display font-semibold text-[#F2EFE6]">
                        {movie.title}
                        <span className="block text-[10px] text-[#565B72] font-normal">{movie.language}</span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {movie.genres && movie.genres.length > 0 ? (
                            movie.genres.map((g: Genre) => (
                              <span key={g.id} className="px-1.5 py-0.5 bg-[#0D1120] text-[#B7BAC9] border border-[#2A3157] text-[10px] rounded">
                                {g.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[#565B72]">-</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono">{movie.duration} phút</td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-[#0D1120] text-[#E8A33D] border border-[#2A3157] font-mono text-[10px] font-bold rounded">
                          {movie.rating || 'P'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            movie.status === 'NOW_SHOWING'
                              ? 'bg-[#5FA777]/20 text-[#5FA777] border border-[#5FA777]/40'
                              : movie.status === 'COMING_SOON'
                              ? 'bg-[#E8A33D]/20 text-[#E8A33D] border border-[#E8A33D]/40'
                              : 'bg-[#8C2F3A]/20 text-[#8C2F3A] border border-[#8C2F3A]/40'
                          }`}
                        >
                          {movie.status === 'NOW_SHOWING' ? 'Đang chiếu' : movie.status === 'COMING_SOON' ? 'Sắp chiếu' : 'Đã dừng'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(movie)}
                          className="px-2.5 py-1 bg-[#0D1120] hover:bg-[#2A3157] text-[#E8A33D] border border-[#2A3157] rounded text-[11px] transition-colors cursor-pointer"
                        >
                          Sửa
                        </button>

                        <button
                          onClick={() => setDeletingMovie(movie)}
                          className="px-2.5 py-1 bg-[#8C2F3A]/20 hover:bg-[#8C2F3A]/40 text-[#8C2F3A] border border-[#8C2F3A]/50 rounded text-[11px] transition-colors cursor-pointer"
                        >
                          Xóa
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
            <div className="p-3.5 border-t border-[#2A3157] flex items-center justify-between text-xs bg-[#0D1120]">
              <span className="text-[#565B72]">Trang {page + 1} / {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  className="px-3 py-1 bg-[#1B2140] border border-[#2A3157] rounded text-[#B7BAC9] disabled:opacity-50 cursor-pointer"
                >
                  Trước
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 bg-[#1B2140] border border-[#2A3157] rounded text-[#B7BAC9] disabled:opacity-50 cursor-pointer"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#12172B]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1B2140] border border-[#2A3157] rounded-xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 relative">
            <div className="flex items-center justify-between border-b border-[#2A3157] pb-3">
              <h3 className="font-display font-bold text-lg text-[#F2EFE6]">
                {editingMovie ? 'Cập Nhật Phim' : 'Thêm Phim Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#B7BAC9] hover:text-[#F2EFE6] cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#B7BAC9] mb-1 font-medium">Tên phim *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                  placeholder="Ví dụ: Avengers: Endgame"
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
                    className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#B7BAC9] mb-1 font-medium">Phân loại khán giả</label>
                  <select
                    value={rating}
                    onChange={e => setRating(e.target.value)}
                    className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                  >
                    <option value="P">P - Phổ biến mọi độ tuổi</option>
                    <option value="K">K - Dưới 13 tuổi cùng cha mẹ</option>
                    <option value="T13">T13 - Khán giả từ 13 tuổi</option>
                    <option value="T16">T16 - Khán giả từ 16 tuổi</option>
                    <option value="T18">T18 - Khán giả từ 18 tuổi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#B7BAC9] mb-1 font-medium">Thể loại phim</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#0D1120] border border-[#2A3157] rounded-lg max-h-28 overflow-y-auto">
                  {genres.map(genre => {
                    const isSelected = selectedGenreIds.includes(genre.id)
                    return (
                      <button
                        type="button"
                        key={genre.id}
                        onClick={() => handleToggleGenre(genre.id)}
                        className={`px-2.5 py-1 rounded text-[11px] border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#E8A33D] text-[#12172B] border-[#E8A33D] font-bold'
                            : 'bg-[#1B2140] text-[#B7BAC9] border-[#2A3157] hover:text-[#F2EFE6]'
                        }`}
                      >
                        {genre.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-[#B7BAC9] mb-1 font-medium">Trạng thái phát hành</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                  >
                    <option value="NOW_SHOWING">Đang chiếu (NOW_SHOWING)</option>
                    <option value="COMING_SOON">Sắp chiếu (COMING_SOON)</option>
                    <option value="END_SHOWING">Đã dừng chiếu (END_SHOWING)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#B7BAC9] mb-1 font-medium">URL Poster (Ảnh)</label>
                <input
                  type="url"
                  value={posterUrl}
                  onChange={e => setPosterUrl(e.target.value)}
                  className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                  placeholder="https://image.tmdb.org/t/p/w500/..."
                />
              </div>

              <div>
                <label className="block text-[#B7BAC9] mb-1 font-medium">URL Trailer (Youtube)</label>
                <input
                  type="url"
                  value={trailerUrl}
                  onChange={e => setTrailerUrl(e.target.value)}
                  className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="block text-[#B7BAC9] mb-1 font-medium">Mô tả tóm tắt</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none resize-none"
                  placeholder="Nội dung tóm tắt bộ phim..."
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
            <h3 className="font-display font-bold text-base text-[#F2EFE6]">Xác Nhận Xóa Phim</h3>
            <p className="text-xs text-[#B7BAC9]">
              Bạn có chắc chắn muốn xóa mềm phim <span className="text-[#E8A33D] font-semibold">"{deletingMovie.title}"</span>?
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingMovie(null)}
                className="bg-[#0D1120] text-[#B7BAC9] border border-[#2A3157] px-4 py-2 rounded-lg text-xs cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
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
