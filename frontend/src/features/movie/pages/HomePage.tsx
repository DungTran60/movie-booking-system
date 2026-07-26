import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import type { ApiResponse } from '@/types'
import type { Movie, MoviePageResponse } from '@/features/movie/types'

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [searchInput, setSearchInput] = useState<string>('')
  
  const [page, setPage] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalElements, setTotalElements] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const size = 8 // 8 movies per page for grid 4x2

  const fetchMovies = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, any> = {
        page,
        size,
        sort: 'createdAt,desc',
      }
      if (statusFilter) params.status = statusFilter
      if (searchTerm) params.search = searchTerm

      const response = await api.get<ApiResponse<MoviePageResponse>>('/v1/movies', { params })
      const envelope = response.data

      if (envelope.status === 'SUCCESS' && envelope.data) {
        setMovies(envelope.data.content || [])
        setTotalPages(envelope.data.totalPages || 1)
        setTotalElements(envelope.data.totalElements || 0)
      } else {
        setError(envelope.message || 'Không thể tải danh sách phim')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovies()
  }, [page, statusFilter, searchTerm])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    setSearchTerm(searchInput.trim())
  }

  const renderRatingBadge = (rating?: string) => {
    if (!rating) return null
    let colorClass = 'bg-[#5FA777]/20 border-[#5FA777]/50 text-[#5FA777]'
    if (rating.toUpperCase().includes('18')) {
      colorClass = 'bg-[#C1443F]/20 border-[#C1443F]/50 text-[#C1443F]'
    } else if (rating.toUpperCase().includes('16') || rating.toUpperCase().includes('13')) {
      colorClass = 'bg-[#E8A33D]/20 border-[#E8A33D]/50 text-[#E8A33D]'
    }

    return (
      <span className={`px-2 py-0.5 border font-semibold text-[10px] rounded tracking-wider uppercase ${colorClass}`}>
        {rating}
      </span>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Marquee Banner */}
      <div className="relative rounded-2xl bg-[#1B2140] border border-[#2A3157] p-6 sm:p-10 overflow-hidden marquee-glow">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E8A33D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8A33D]/10 border border-[#E8A33D]/30 text-[#E8A33D] text-xs font-semibold uppercase tracking-widest">
            ✨ Rạp Chiếu Phim Đỉnh Cao
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F2EFE6] leading-tight">
            Lịch Chiếu & Vé Phim Mới Nhất
          </h1>
          <p className="text-[#B7BAC9] text-sm leading-relaxed">
            Khám phá các bộ phim bom tấn đang chiếu tại rạp. Đặt vé nhanh chóng và trải nghiệm âm thanh sống động.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Tìm kiếm theo tên phim..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#0D1120] border border-[#2A3157] rounded-lg text-[#F2EFE6] placeholder-[#565B72] text-sm focus:outline-none focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D] transition-all"
              />
              <span className="absolute left-3.5 top-3 text-[#565B72] text-sm">🔍</span>
            </div>
            <button
              type="submit"
              className="bg-[#E8A33D] hover:bg-[#F2B655] active:translate-y-[1px] text-[#12172B] font-semibold px-5 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow-md shadow-[#E8A33D]/10"
            >
              Tìm Phim
            </button>
          </form>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3157] pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => {
              setStatusFilter('')
              setPage(0)
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === ''
                ? 'bg-[#E8A33D] text-[#12172B] shadow-md shadow-[#E8A33D]/20'
                : 'bg-[#1B2140] text-[#B7BAC9] hover:text-[#F2EFE6] border border-[#2A3157]'
            }`}
          >
            TẤT CẢ PHIM
          </button>
          <button
            onClick={() => {
              setStatusFilter('NOW_SHOWING')
              setPage(0)
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'NOW_SHOWING'
                ? 'bg-[#E8A33D] text-[#12172B] shadow-md shadow-[#E8A33D]/20'
                : 'bg-[#1B2140] text-[#B7BAC9] hover:text-[#F2EFE6] border border-[#2A3157]'
            }`}
          >
            🔥 PHIM ĐANG CHIẾU
          </button>
          <button
            onClick={() => {
              setStatusFilter('COMING')
              setPage(0)
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'COMING'
                ? 'bg-[#E8A33D] text-[#12172B] shadow-md shadow-[#E8A33D]/20'
                : 'bg-[#1B2140] text-[#B7BAC9] hover:text-[#F2EFE6] border border-[#2A3157]'
            }`}
          >
            🎬 PHIM SẮP CHIẾU
          </button>
        </div>

        <div className="text-xs text-[#B7BAC9]">
          Hiển thị <span className="font-semibold text-[#E8A33D]">{movies.length}</span> / {totalElements} phim
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 text-center text-[#E8A33D] space-y-3">
          <div className="text-4xl animate-spin">🍿</div>
          <p className="text-xs uppercase tracking-widest text-[#B7BAC9]">Đang tải danh sách phim...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-6 bg-[#C1443F]/15 border border-[#C1443F]/40 text-[#F2EFE6] rounded-xl text-center space-y-2">
          <p className="text-sm font-semibold">⚠️ {error}</p>
          <button
            onClick={fetchMovies}
            className="text-xs text-[#E8A33D] underline hover:text-[#F2B655] cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && movies.length === 0 && (
        <div className="py-20 text-center space-y-3 bg-[#1B2140] rounded-xl border border-[#2A3157] p-8">
          <div className="text-5xl">🎞️</div>
          <h3 className="font-display text-xl font-bold text-[#F2EFE6]">Không tìm thấy bộ phim nào</h3>
          <p className="text-xs text-[#B7BAC9]">
            Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
          </p>
        </div>
      )}

      {/* Movie Grid */}
      {!loading && !error && movies.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map(movie => (
            <div
              key={movie.id}
              className="group bg-[#1B2140] border border-[#2A3157] rounded-xl overflow-hidden shadow-lg hover:border-[#E8A33D]/60 transition-all flex flex-col"
            >
              {/* Poster Container (Aspect Ratio 2:3) */}
              <div className="relative aspect-[2/3] bg-[#0D1120] overflow-hidden">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-[#565B72]">
                    🎬
                  </div>
                )}

                {/* Rating Badge Overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  {renderRatingBadge(movie.rating)}
                </div>

                {/* Status Badge Overlay */}
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                      movie.status === 'NOW_SHOWING'
                        ? 'bg-[#E8A33D] text-[#12172B]'
                        : 'bg-[#1B2140]/90 border border-[#2A3157] text-[#B7BAC9]'
                    }`}
                  >
                    {movie.status === 'NOW_SHOWING' ? 'ĐANG CHIẾU' : 'SẮP CHIẾU'}
                  </span>
                </div>
              </div>

              {/* Movie Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-display font-semibold text-base text-[#F2EFE6] group-hover:text-[#E8A33D] transition-colors line-clamp-1">
                    <Link to={`/movies/${movie.slug}`}>{movie.title}</Link>
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-[#B7BAC9] mt-1">
                    <span>⏱️ {movie.duration} phút</span>
                    {movie.language && (
                      <>
                        <span>•</span>
                        <span>{movie.language}</span>
                      </>
                    )}
                  </div>

                  {/* Genres */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {movie.genres.slice(0, 2).map(genre => (
                        <span
                          key={genre.id}
                          className="px-2 py-0.5 bg-[#0D1120] text-[#B7BAC9] text-[10px] rounded border border-[#2A3157]"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action CTA */}
                <Link
                  to={`/movies/${movie.slug}`}
                  className="w-full mt-2 bg-[#E8A33D] hover:bg-[#F2B655] text-[#12172B] font-semibold py-2 px-3 rounded-lg text-xs text-center transition-colors block"
                >
                  {movie.status === 'NOW_SHOWING' ? '🎟️ ĐẶT VÉ NGAY' : '🔍 CHI TIẾT PHIM'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(p - 1, 0))}
            className="px-4 py-2 rounded-lg bg-[#1B2140] border border-[#2A3157] text-[#F2EFE6] text-xs font-medium hover:border-[#E8A33D] disabled:opacity-40 disabled:hover:border-[#2A3157] transition-all cursor-pointer"
          >
            ← Trang Trước
          </button>

          <div className="px-4 py-2 bg-[#0D1120] border border-[#2A3157] rounded-lg text-xs font-mono text-[#E8A33D]">
            Trang {page + 1} / {totalPages}
          </div>

          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
            className="px-4 py-2 rounded-lg bg-[#1B2140] border border-[#2A3157] text-[#F2EFE6] text-xs font-medium hover:border-[#E8A33D] disabled:opacity-40 disabled:hover:border-[#2A3157] transition-all cursor-pointer"
          >
            Trang Sau →
          </button>
        </div>
      )}
    </div>
  )
}
