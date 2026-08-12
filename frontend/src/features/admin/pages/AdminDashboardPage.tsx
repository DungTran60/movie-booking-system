import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import AdminMovieManager from '../components/AdminMovieManager'
import AdminCinemaManager from '../components/AdminCinemaManager'
import AdminRoomManager from '../components/AdminRoomManager'
import AdminShowtimeManager from '../components/AdminShowtimeManager'
import type { Cinema } from '../types'

export default function AdminDashboardPage() {
  const { logout, user } = useAuth()
  const [activeTab, setActiveTab] = useState<'movies' | 'cinemas' | 'rooms' | 'showtimes'>('movies')
  const [selectedCinemaForRooms, setSelectedCinemaForRooms] = useState<number | null>(null)

  const handleSelectCinemaForRooms = (cinema: Cinema) => {
    setSelectedCinemaForRooms(cinema.id)
    setActiveTab('rooms')
  }

  return (
    <div className="space-y-6">
      {/* Title & Actions Header */}
      <div className="bg-[#1B2140] border border-[#2A3157] rounded-xl p-6 relative overflow-hidden marquee-glow">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#E8A33D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#E8A33D]/10 border border-[#E8A33D]/30 text-[#E8A33D] text-[10px] font-semibold uppercase tracking-widest">
              Bảng Quản Trị Hệ Thống
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F2EFE6]">
              CineTicket Admin Management
            </h1>
            <p className="text-xs text-[#B7BAC9]">
              Quản lý toàn bộ thông tin Phim, Rạp chiếu, Phòng chiếu và Suất chiếu
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs text-[#B7BAC9] hover:text-[#E8A33D] bg-[#0D1120] border border-[#2A3157] px-3.5 py-2 rounded-lg transition-colors"
            >
              Về Trang Chủ
            </Link>
            <button
              onClick={() => logout()}
              className="bg-[#8C2F3A] hover:bg-[#A63530] text-[#F2EFE6] text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Đăng Xuất ({user?.role || 'ADMIN'})
            </button>
          </div>
        </div>
      </div>

      {/* Admin Tab Buttons */}
      <div className="flex flex-wrap border-b border-[#2A3157] gap-2">
        <button
          onClick={() => setActiveTab('movies')}
          className={`px-5 py-2.5 font-display text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
            activeTab === 'movies'
              ? 'bg-[#1B2140] text-[#E8A33D] border-t-2 border-[#E8A33D] border-x border-[#2A3157]'
              : 'text-[#B7BAC9] hover:text-[#F2EFE6]'
          }`}
        >
          Quản Lý Phim (CRUD)
        </button>

        <button
          onClick={() => setActiveTab('cinemas')}
          className={`px-5 py-2.5 font-display text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
            activeTab === 'cinemas'
              ? 'bg-[#1B2140] text-[#E8A33D] border-t-2 border-[#E8A33D] border-x border-[#2A3157]'
              : 'text-[#B7BAC9] hover:text-[#F2EFE6]'
          }`}
        >
          Quản Lý Rạp Chiếu
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-5 py-2.5 font-display text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
            activeTab === 'rooms'
              ? 'bg-[#1B2140] text-[#E8A33D] border-t-2 border-[#E8A33D] border-x border-[#2A3157]'
              : 'text-[#B7BAC9] hover:text-[#F2EFE6]'
          }`}
        >
          Quản Lý Phòng Chiếu
        </button>

        <button
          onClick={() => setActiveTab('showtimes')}
          className={`px-5 py-2.5 font-display text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
            activeTab === 'showtimes'
              ? 'bg-[#1B2140] text-[#E8A33D] border-t-2 border-[#E8A33D] border-x border-[#2A3157]'
              : 'text-[#B7BAC9] hover:text-[#F2EFE6]'
          }`}
        >
          Quản Lý Suất Chiếu
        </button>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'movies' && <AdminMovieManager />}
        {activeTab === 'cinemas' && (
          <AdminCinemaManager onSelectCinemaForRooms={handleSelectCinemaForRooms} />
        )}
        {activeTab === 'rooms' && (
          <AdminRoomManager selectedCinemaId={selectedCinemaForRooms} />
        )}
        {activeTab === 'showtimes' && <AdminShowtimeManager />}
      </div>
    </div>
  )
}
