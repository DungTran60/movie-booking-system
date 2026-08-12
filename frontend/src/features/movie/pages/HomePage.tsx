import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import type { ApiResponse, PaginatedResponse } from '@/types'
import type { Movie } from '../types'

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [statusFilter, setStatusFilter] = useState<'NOW_SHOWING' | 'COMING_SOON'>('NOW_SHOWING')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMovies = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Movie>>>('/v1/movies', {
        params: {
          page,
          size: 8,
          status: statusFilter,
          search: searchTerm || undefined,
        },
      })

      if (response.data.status === 'SUCCESS' && response.data.data) {
        setMovies(response.data.data.content)
        setTotalPages(response.data.data.totalPages)
      } else {
        setError(response.data.message || 'Không thể tải danh sách phim')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách phim')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovies()
  }, [page, statusFilter, searchTerm])

  const handleFilterChange = (status: 'NOW_SHOWING' | 'COMING_SOON') => {
    setStatusFilter(status)
    setPage(0)
  }

  return (
    <div className="space-y-10">
      {/* Hero Banner Section */}
      <section className="relative rounded-2xl overflow-hidden bg-[#1B2140] border border-[#2A3157] p-8 md:p-12 marquee-glow">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8A33D]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8A33D]/10 border border-[#E8A33D]/30 text-[#E8A33D] text-xs font-semibold uppercase tracking-widest">
            Hệ Thống Đặt Vé Phim Hàng Đầu
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight text-[#F2EFE6]">
            Trải Nghiệm Điện Ảnh <br />
            <span className="text-[#E8A33D] underline decoration-[#E8A33D]/40">Đỉnh Cao & Đẳng Cấp</span>
          </h1>

          <p className="text-sm text-[#B7BAC9] leading-relaxed">
            Đặt vé phim chiếu rạp trực tuyến dễ dàng, chọn vị trí ghế VIP yêu thích và cập nhật lịch chiếu phim mới nhất với giá vé ưu đãi.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              to="/showtimes"
              className="bg-[#E8A33D] hover:bg-[#F2B655] text-[#12172B] font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#E8A33D]/20 hover:scale-105"
            >
              Đặt Vé Ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Filter and Search Section */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#2A3157] pb-6">
        {/* Status Tabs */}
        <div className="flex bg-[#1B2140] p-1 rounded-xl border border-[#2A3157]">
          <button
            onClick={() => handleFilterChange('NOW_SHOWING')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'NOW_SHOWING'
                ? 'bg-[#E8A33D] text-[#12172B] shadow'
                : 'text-[#B7BAC9] hover:text-[#F2EFE6]'
            }`}
          >
            PHIM ĐANG CHIẾU
          </button>
          <button
            onClick={() => handleFilterChange('COMING_SOON')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'COMING_SOON'
                ? 'bg-[#E8A33D] text-[#12172B] shadow'
                : 'text-[#B7BAC9] hover:text-[#F2EFE6]'
            }`}
          >
            PHIM SẮP CHIẾU
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72 bg-[#1B2140] border border-[#2A3157] rounded-xl px-3.5 py-2 flex items-center gap-2 focus-within:border-[#E8A33D]">
          <input
            type="text"
            placeholder="Tìm kiếm phim..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-[#F2EFE6] placeholder-[#565B72] focus:outline-none w-full"
          />
        </div>
      </section>

      {/* Movies Grid */}
      {loading ? (
        <div className="py-20 text-center text-[#E8A33D] text-xs uppercase tracking-widest animate-pulse">
          Đang tải danh sách phim...
        </div>
      ) : error ? (
        <div className="p-6 bg-[#C1443F]/10 border border-[#C1443F]/30 rounded-xl text-center text-[#C1443F]">
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="py-16 text-center bg-[#1B2140] border border-[#2A3157] rounded-2xl space-y-3">
          <h3 className="font-display font-semibold text-[#F2EFE6]">Không tìm thấy bộ phim nào</h3>
          <p className="text-xs text-[#565B72]">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map(movie => (
            <div
              key={movie.id}
              className="bg-[#1B2140] border border-[#2A3157] rounded-xl overflow-hidden group hover:border-[#E8A33D]/60 transition-all flex flex-col hover:-translate-y-1 shadow-lg"
            >
              {/* Poster Image Container */}
              <div className="relative aspect-[2/3] bg-[#0D1120] overflow-hidden">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#565B72]">
                    Chưa có poster
                  </div>
                )}

                {/* Rating Badge */}
                {movie.rating && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#0D1120]/80 backdrop-blur-sm border border-[#2A3157] text-[#E8A33D] font-mono text-[10px] font-bold">
                    {movie.rating}
                  </span>
                )}
              </div>

              {/* Movie Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base text-[#F2EFE6] line-clamp-1 group-hover:text-[#E8A33D] transition-colors">
                    {movie.title}
                  </h3>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1">
                    {movie.genres && movie.genres.length > 0 ? (
                      movie.genres.map(g => (
                        <span key={g.id} className="text-[10px] text-[#B7BAC9] bg-[#0D1120] px-1.5 py-0.5 rounded border border-[#2A3157]">
                          {g.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-[#565B72]">Phim chiếu rạp</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#2A3157]/60 flex items-center justify-between text-[11px] text-[#B7BAC9]">
                  <span className="font-mono">{movie.duration} phút</span>
                  <span className="text-[#E8A33D] font-medium">{movie.language || 'Tiếng Việt'}</span>
                </div>

                {/* Action Link */}
                <Link
                  to={`/movies/${movie.slug}`}
                  className="w-full text-center bg-[#0D1120] hover:bg-[#E8A33D] text-[#E8A33D] hover:text-[#12172B] font-semibold text-xs py-2 rounded-lg transition-all border border-[#2A3157] hover:border-[#E8A33D]"
                >
                  {movie.status === 'NOW_SHOWING' ? 'ĐẶT VÉ NGAY' : 'CHI TIẾT PHIM'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            className="px-4 py-2 bg-[#1B2140] border border-[#2A3157] rounded-xl text-xs text-[#B7BAC9] hover:text-[#F2EFE6] disabled:opacity-50 transition-colors cursor-pointer"
          >
            Trang Trước
          </button>
          <span className="px-4 py-2 text-xs text-[#B7BAC9] flex items-center font-mono">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-[#1B2140] border border-[#2A3157] rounded-xl text-xs text-[#B7BAC9] hover:text-[#F2EFE6] disabled:opacity-50 transition-colors cursor-pointer"
          >
            Trang Sau
          </button>
        </div>
      )}
    </div>
  )
}
