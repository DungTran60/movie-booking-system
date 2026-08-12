import { useState, useEffect } from 'react'
import api from '@/services/api'
import type { ApiResponse } from '@/types'
import type { Cinema, CreateCinemaPayload } from '../types'

interface AdminCinemaManagerProps {
  onSelectCinemaForRooms?: (cinema: Cinema) => void
}

export default function AdminCinemaManager({ onSelectCinemaForRooms }: AdminCinemaManagerProps) {
  const [cinemas, setCinemas] = useState<Cinema[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingCinema, setEditingCinema] = useState<Cinema | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Form states
  const [name, setName] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [city, setCity] = useState<string>('Hồ Chí Minh')
  const [status, setStatus] = useState<string>('ACTIVE')

  const fetchCinemas = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<ApiResponse<Cinema[]>>('/v1/admin/cinemas')
      if (response.data.status === 'SUCCESS' && response.data.data) {
        setCinemas(response.data.data)
      } else {
        setError(response.data.message || 'Không thể tải danh sách rạp chiếu')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách rạp chiếu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCinemas()
  }, [])

  const handleOpenAddModal = () => {
    setEditingCinema(null)
    setName('')
    setAddress('')
    setCity('Hồ Chí Minh')
    setStatus('ACTIVE')
    setShowModal(true)
  }

  const handleOpenEditModal = (cinema: Cinema) => {
    setEditingCinema(cinema)
    setName(cinema.name)
    setAddress(cinema.address)
    setCity(cinema.city || 'Hồ Chí Minh')
    setStatus(cinema.status)
    setShowModal(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !address.trim()) {
      setError('Vui lòng nhập tên rạp và địa chỉ đầy đủ')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    const payload: CreateCinemaPayload = {
      name,
      address,
      city,
      status,
    }

    try {
      if (editingCinema) {
        const response = await api.put<ApiResponse<Cinema>>(`/v1/admin/cinemas/${editingCinema.id}`, payload)
        if (response.data.status === 'SUCCESS') {
          setSuccessMsg(`Cập nhật rạp "${name}" thành công!`)
          setShowModal(false)
          fetchCinemas()
        } else {
          setError(response.data.message || 'Không thể cập nhật rạp')
        }
      } else {
        const response = await api.post<ApiResponse<Cinema>>('/v1/admin/cinemas', payload)
        if (response.data.status === 'SUCCESS') {
          setSuccessMsg(`Thêm rạp chiếu mới "${name}" thành công!`)
          setShowModal(false)
          fetchCinemas()
        } else {
          setError(response.data.message || 'Không thể thêm rạp mới')
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin rạp')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1B2140] p-5 rounded-xl border border-[#2A3157]">
        <div>
          <h2 className="font-display text-xl font-bold text-[#F2EFE6]">Quản Lý Rạp Chiếu</h2>
          <p className="text-xs text-[#B7BAC9] mt-0.5">Thêm mới, cập nhật thông tin rạp và xem danh sách phòng chiếu</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-[#E8A33D] hover:bg-[#F2B655] text-[#12172B] font-semibold text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow-md shadow-[#E8A33D]/10"
        >
          Thêm Rạp Mới
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

      {/* Cinema Table */}
      {loading ? (
        <div className="py-12 text-center text-[#E8A33D] text-xs uppercase tracking-widest animate-pulse">
          Đang tải danh sách rạp...
        </div>
      ) : (
        <div className="bg-[#1B2140] border border-[#2A3157] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#B7BAC9]">
              <thead className="bg-[#0D1120] text-[#F2EFE6] uppercase text-[10px] tracking-wider border-b border-[#2A3157]">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Tên Rạp</th>
                  <th className="p-3.5">Địa Chỉ</th>
                  <th className="p-3.5">Thành Phố</th>
                  <th className="p-3.5">Trạng Thái</th>
                  <th className="p-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3157]/60">
                {cinemas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#565B72]">
                      Chưa có rạp chiếu nào.
                    </td>
                  </tr>
                ) : (
                  cinemas.map(cinema => (
                    <tr key={cinema.id} className="hover:bg-[#0D1120]/50 transition-colors">
                      <td className="p-3.5 font-mono text-[#E8A33D]">#{cinema.id}</td>

                      <td className="p-3.5 font-display font-semibold text-[#F2EFE6]">
                        {cinema.name}
                      </td>

                      <td className="p-3.5 max-w-xs truncate">{cinema.address}</td>

                      <td className="p-3.5">{cinema.city}</td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            cinema.status === 'ACTIVE'
                              ? 'bg-[#5FA777]/20 text-[#5FA777] border border-[#5FA777]/40'
                              : 'bg-[#8C2F3A]/20 text-[#8C2F3A] border border-[#8C2F3A]/40'
                          }`}
                        >
                          {cinema.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        {onSelectCinemaForRooms && (
                          <button
                            onClick={() => onSelectCinemaForRooms(cinema)}
                            className="px-2.5 py-1 bg-[#E8A33D]/10 hover:bg-[#E8A33D]/20 text-[#E8A33D] border border-[#E8A33D]/30 rounded text-[11px] transition-colors cursor-pointer"
                          >
                            Phòng chiếu
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEditModal(cinema)}
                          className="px-2.5 py-1 bg-[#0D1120] hover:bg-[#2A3157] text-[#B7BAC9] border border-[#2A3157] rounded text-[11px] transition-colors cursor-pointer"
                        >
                          Sửa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#12172B]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1B2140] border border-[#2A3157] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-[#2A3157] pb-3">
              <h3 className="font-display font-bold text-lg text-[#F2EFE6]">
                {editingCinema ? 'Cập Nhật Rạp Chiếu' : 'Thêm Rạp Chiếu Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#B7BAC9] hover:text-[#F2EFE6] cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#B7BAC9] mb-1 font-medium">Tên rạp chiếu *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                  placeholder="Ví dụ: CineTicket Landmark 81"
                />
              </div>

              <div>
                <label className="block text-[#B7BAC9] mb-1 font-medium">Địa chỉ chi tiết *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                  placeholder="Ví dụ: 720A Điện Biên Phủ, P.22, Q. Bình Thạnh"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#B7BAC9] mb-1 font-medium">Thành phố</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
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
                    <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                    <option value="INACTIVE">Tạm dừng (INACTIVE)</option>
                  </select>
                </div>
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
                  {submitting ? 'Đang Lưu...' : 'Lưu Rạp Chiếu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
