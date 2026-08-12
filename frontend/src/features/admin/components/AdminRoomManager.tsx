import { useState, useEffect } from 'react'
import api from '@/services/api'
import type { ApiResponse } from '@/types'
import type { Cinema, Room, CreateRoomPayload } from '@/features/admin/types'
import AdminSeatConfigModal from './AdminSeatConfigModal'

interface AdminRoomManagerProps {
  selectedCinemaId?: number | null
}

export default function AdminRoomManager({ selectedCinemaId }: AdminRoomManagerProps) {
  const [cinemas, setCinemas] = useState<Cinema[]>([])
  const [currentCinemaId, setCurrentCinemaId] = useState<number | null>(selectedCinemaId || null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null)
  const [configSeatRoom, setConfigSeatRoom] = useState<Room | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Form states
  const [name, setName] = useState<string>('')
  const [totalSeats, setTotalSeats] = useState<number>(100)

  const fetchCinemas = async () => {
    try {
      const response = await api.get<ApiResponse<Cinema[]>>('/v1/admin/cinemas')
      if (response.data.status === 'SUCCESS' && response.data.data) {
        setCinemas(response.data.data)
        if (!currentCinemaId && response.data.data.length > 0) {
          setCurrentCinemaId(response.data.data[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching cinemas for rooms:', err)
    }
  }

  const fetchRooms = async (cinemaId: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<ApiResponse<Room[]>>(`/v1/admin/cinemas/${cinemaId}/rooms`)
      if (response.data.status === 'SUCCESS' && response.data.data) {
        setRooms(response.data.data)
      } else {
        setError(response.data.message || 'Không thể tải danh sách phòng chiếu')
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Rạp chiếu không tồn tại')
      } else {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách phòng chiếu')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCinemas()
  }, [])

  useEffect(() => {
    if (currentCinemaId) {
      fetchRooms(currentCinemaId)
    } else {
      setRooms([])
    }
  }, [currentCinemaId])

  const handleOpenAddModal = () => {
    if (!currentCinemaId) {
      setError('Vui lòng chọn rạp chiếu trước khi tạo phòng')
      return
    }
    setEditingRoom(null)
    setName('')
    setTotalSeats(100)
    setShowModal(true)
  }

  const handleOpenEditModal = (room: Room) => {
    setEditingRoom(room)
    setName(room.name)
    setTotalSeats(room.totalSeats || 100)
    setShowModal(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !currentCinemaId) {
      setError('Vui lòng nhập tên phòng chiếu hợp lệ')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    const payload: CreateRoomPayload = {
      name,
      totalSeats: Number(totalSeats),
    }

    try {
      if (editingRoom) {
        const response = await api.put<ApiResponse<Room>>(
          `/v1/admin/cinemas/${currentCinemaId}/rooms/${editingRoom.id}`,
          payload
        )
        if (response.data.status === 'SUCCESS') {
          setSuccessMsg(`Cập nhật phòng "${name}" thành công!`)
          setShowModal(false)
          fetchRooms(currentCinemaId)
        } else {
          setError(response.data.message || 'Không thể cập nhật phòng')
        }
      } else {
        const response = await api.post<ApiResponse<Room>>(
          `/v1/admin/cinemas/${currentCinemaId}/rooms`,
          payload
        )
        if (response.data.status === 'SUCCESS') {
          setSuccessMsg(`Thêm phòng chiếu mới "${name}" thành công!`)
          setShowModal(false)
          fetchRooms(currentCinemaId)
        } else {
          setError(response.data.message || 'Không thể tạo phòng mới')
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin phòng')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingRoom || !currentCinemaId) return

    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const response = await api.delete<ApiResponse<void>>(
        `/v1/admin/cinemas/${currentCinemaId}/rooms/${deletingRoom.id}`
      )
      if (response.data.status === 'SUCCESS') {
        setSuccessMsg(`Đã xóa phòng chiếu "${deletingRoom.name}".`)
        setDeletingRoom(null)
        fetchRooms(currentCinemaId)
      } else {
        setError(response.data.message || 'Không thể xóa phòng')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa phòng')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1B2140] p-5 rounded-xl border border-[#2A3157]">
        <div className="space-y-2">
          <div>
            <h2 className="font-display text-xl font-bold text-[#F2EFE6]">Quản Lý Phòng Chiếu</h2>
            <p className="text-xs text-[#B7BAC9] mt-0.5">Quản lý các phòng chiếu gắn theo từng rạp chiếu</p>
          </div>

          {/* Cinema Selector */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-[#B7BAC9] font-medium">Chọn Rạp Chiếu:</span>
            <select
              value={currentCinemaId || ''}
              onChange={e => setCurrentCinemaId(Number(e.target.value))}
              className="bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] text-xs px-3 py-1.5 rounded-lg focus:border-[#E8A33D] focus:outline-none"
            >
              {cinemas.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-[#E8A33D] hover:bg-[#F2B655] text-[#12172B] font-semibold text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow-md shadow-[#E8A33D]/10 shrink-0"
        >
          Thêm Phòng Mới
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

      {/* Room Table */}
      {loading ? (
        <div className="py-12 text-center text-[#E8A33D] text-xs uppercase tracking-widest animate-pulse">
          Đang tải danh sách phòng chiếu...
        </div>
      ) : (
        <div className="bg-[#1B2140] border border-[#2A3157] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#B7BAC9]">
              <thead className="bg-[#0D1120] text-[#F2EFE6] uppercase text-[10px] tracking-wider border-b border-[#2A3157]">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Tên Phòng</th>
                  <th className="p-3.5">Tổng Số Ghế</th>
                  <th className="p-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3157]/60">
                {rooms.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-[#565B72]">
                      Chưa có phòng chiếu nào trong rạp này.
                    </td>
                  </tr>
                ) : (
                  rooms.map(room => (
                    <tr key={room.id} className="hover:bg-[#0D1120]/50 transition-colors">
                      <td className="p-3.5 font-mono text-[#E8A33D]">#{room.id}</td>

                      <td className="p-3.5 font-display font-semibold text-[#F2EFE6]">
                        {room.name}
                      </td>

                      <td className="p-3.5 font-mono text-[#F2EFE6]">
                        {room.totalSeats || 0} ghế
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => setConfigSeatRoom(room)}
                          className="px-2.5 py-1 bg-[#E8A33D]/10 hover:bg-[#E8A33D]/20 text-[#E8A33D] border border-[#E8A33D]/30 rounded text-[11px] transition-colors cursor-pointer"
                        >
                          Sơ đồ ghế
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(room)}
                          className="px-2.5 py-1 bg-[#0D1120] hover:bg-[#2A3157] text-[#B7BAC9] border border-[#2A3157] rounded text-[11px] transition-colors cursor-pointer"
                        >
                          Sửa
                        </button>

                        <button
                          onClick={() => setDeletingRoom(room)}
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
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#12172B]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1B2140] border border-[#2A3157] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-[#2A3157] pb-3">
              <h3 className="font-display font-bold text-lg text-[#F2EFE6]">
                {editingRoom ? 'Cập Nhật Phòng Chiếu' : 'Thêm Phòng Chiếu Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#B7BAC9] hover:text-[#F2EFE6] cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#B7BAC9] mb-1 font-medium">Tên phòng chiếu *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none"
                  placeholder="Ví dụ: Phòng 01"
                />
              </div>

              <div>
                <label className="block text-[#B7BAC9] mb-1 font-medium">Tổng số ghế</label>
                <input
                  type="number"
                  min={10}
                  max={500}
                  value={totalSeats}
                  onChange={e => setTotalSeats(Number(e.target.value))}
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
                  {submitting ? 'Đang Lưu...' : 'Lưu Phòng Chiếu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRoom && (
        <div className="fixed inset-0 z-50 bg-[#12172B]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1B2140] border border-[#2A3157] rounded-xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-base text-[#F2EFE6]">Xác Nhận Xóa Phòng Chiếu</h3>
            <p className="text-xs text-[#B7BAC9]">
              Bạn có chắc chắn muốn xóa phòng chiếu <span className="text-[#E8A33D] font-semibold">"{deletingRoom.name}"</span>?
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingRoom(null)}
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

      {/* Seat Config Modal */}
      {configSeatRoom && (
        <AdminSeatConfigModal
          room={configSeatRoom}
          onClose={() => setConfigSeatRoom(null)}
          onSuccess={total => {
            setSuccessMsg(`Đã sinh sơ đồ gồm ${total} ghế cho phòng "${configSeatRoom.name}".`)
            setConfigSeatRoom(null)
            if (currentCinemaId) fetchRooms(currentCinemaId)
          }}
        />
      )}
    </div>
  )
}
