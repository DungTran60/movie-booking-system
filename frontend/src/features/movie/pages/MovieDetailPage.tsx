import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '@/services/api'
import { getEmbedYoutubeUrl } from '@/utils/media'
import type { ApiResponse } from '@/types'
import type { MovieDetail } from '@/features/movie/types'

export default function MovieDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMovieDetail = async () => {
    if (!slug) return
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<ApiResponse<MovieDetail>>(`/v1/movies/${slug}`)
      const envelope = response.data

      if (envelope.status === 'SUCCESS' && envelope.data) {
        setMovie(envelope.data)
      } else {
        setError(envelope.message || 'Không tìm thấy thông tin phim')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin phim')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovieDetail()
  }, [slug])

  const renderRatingBadge = (rating?: string) => {
    if (!rating) return null
    let colorClass = 'bg-[#5FA777]/20 border-[#5FA777]/50 text-[#5FA777]'
    if (rating.toUpperCase().includes('18')) {
      colorClass = 'bg-[#C1443F]/20 border-[#C1443F]/50 text-[#C1443F]'
    } else if (rating.toUpperCase().includes('16') || rating.toUpperCase().includes('13')) {
      colorClass = 'bg-[#E8A33D]/20 border-[#E8A33D]/50 text-[#E8A33D]'
    }

    return (
      <span className={`px-2.5 py-1 border font-bold text-xs rounded tracking-wider uppercase ${colorClass}`}>
        Phân Loại {rating}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="py-24 text-center text-[#E8A33D] space-y-3">
        <p className="text-xs uppercase tracking-widest text-[#B7BAC9] animate-pulse">Đang tải chi tiết phim...</p>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-4 bg-[#1B2140] rounded-xl border border-[#2A3157] p-8">
        <h2 className="font-display text-xl font-bold text-[#F2EFE6]">
          {error || 'Không tìm thấy phim'}
        </h2>
        <Link
          to="/"
          className="inline-block bg-[#E8A33D] hover:bg-[#F2B655] text-[#12172B] font-semibold py-2 px-5 rounded-lg text-xs transition-colors"
        >
          ← Quay Lại Trang Chủ
        </Link>
      </div>
    )
  }

  const embedTrailerUrl = getEmbedYoutubeUrl(movie.trailerUrl)

  return (
    <div className="space-y-10">
      {/* Hero Backdrop Section */}
      <div className="relative rounded-2xl bg-[#1B2140] border border-[#2A3157] overflow-hidden marquee-glow">
        {/* Backdrop Blurred Blur Overlay */}
        {movie.posterUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center blur-2xl opacity-25 scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${movie.posterUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B2140] via-[#1B2140]/80 to-transparent pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row gap-8">
          {/* Main Poster (Aspect Ratio 2:3) */}
          <div className="w-48 sm:w-64 flex-shrink-0 mx-auto md:mx-0">
            <div className="aspect-[2/3] rounded-xl bg-[#0D1120] border border-[#2A3157] overflow-hidden shadow-2xl relative">
              {movie.posterUrl ? (
                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#565B72]">
                  Chưa có poster
                </div>
              )}
            </div>
          </div>

          {/* Info Column */}
          <div className="flex-1 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-[#E8A33D] text-[#12172B] font-bold text-xs rounded uppercase tracking-wider">
                  {movie.status === 'NOW_SHOWING' ? 'ĐANG CHIẾU' : 'SẮP CHIẾU'}
                </span>
                {renderRatingBadge(movie.rating)}
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F2EFE6] leading-tight">
                {movie.title}
              </h1>

              {/* Meta Stats */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#B7BAC9]">
                <span>{movie.duration} phút</span>
                {movie.language && (
                  <>
                    <span>•</span>
                    <span>{movie.language}</span>
                  </>
                )}
                {movie.releaseDate && (
                  <>
                    <span>•</span>
                    <span>Khởi chiếu: {movie.releaseDate}</span>
                  </>
                )}
              </div>

              {/* Genres Badge List */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {movie.genres.map(genre => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-[#0D1120] text-[#E8A33D] text-xs font-medium rounded-lg border border-[#2A3157]"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              {movie.description && (
                <div className="pt-2 text-sm text-[#B7BAC9] leading-relaxed max-w-3xl">
                  <h3 className="text-xs uppercase tracking-wider text-[#F2EFE6] font-semibold mb-1">
                    Nội Dung Phim:
                  </h3>
                  <p>{movie.description}</p>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="pt-4 border-t border-[#2A3157]/80">
              <Link
                to="/showtimes"
                className="inline-flex items-center justify-center gap-2 bg-[#E8A33D] hover:bg-[#F2B655] text-[#12172B] font-bold py-3 px-8 rounded-lg text-sm transition-all shadow-lg shadow-[#E8A33D]/20"
              >
                CHỌN SUẤT CHIẾU & ĐẶT VÉ
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Video Section */}
      {embedTrailerUrl && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-[#F2EFE6]">
            Trailer Chính Thức
          </h2>
          <div className="aspect-video w-full rounded-2xl bg-[#0D1120] border border-[#2A3157] overflow-hidden shadow-2xl">
            <iframe
              src={embedTrailerUrl}
              title={`Trailer ${movie.title}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Showtimes List Section */}
      <div id="showtimes" className="space-y-6 pt-4">
        <div className="border-b border-[#2A3157] pb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-[#F2EFE6]">
            Lịch Chiếu Tại Rạp
          </h2>
          <span className="text-xs text-[#E8A33D] font-mono">Hôm Nay</span>
        </div>

        {/* Showtime Card Demo List */}
        <div className="bg-[#1B2140] border border-[#2A3157] rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-[#2A3157]/60 pb-4">
            <div>
              <h3 className="font-display text-base font-semibold text-[#F2EFE6]">
                CineTicket Cinema 1 — Trung Tâm
              </h3>
              <p className="text-xs text-[#B7BAC9] mt-0.5">
                123 Đường Lớn, Quận 1, TP. Hồ Chí Minh
              </p>
            </div>
            <span className="px-2.5 py-1 bg-[#0D1120] text-[#5FA777] text-xs font-mono rounded border border-[#2A3157]">
              2D Phụ Đề
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-[#B7BAC9] uppercase tracking-wider">
              Chọn suất chiếu:
            </p>
            <div className="flex flex-wrap gap-3">
              {['10:15', '13:30', '16:45', '19:15', '21:30'].map((time, idx) => (
                <Link
                  key={idx}
                  to={`/showtimes`}
                  className="px-4 py-2 bg-[#0D1120] hover:bg-[#E8A33D] hover:text-[#12172B] border border-[#2A3157] rounded-lg text-sm font-mono font-semibold text-[#F2EFE6] transition-all cursor-pointer shadow-sm"
                >
                  {time}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
