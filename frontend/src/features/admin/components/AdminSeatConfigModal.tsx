import { useState } from 'react'
import api from '@/services/api'
import type { ApiResponse } from '@/types'
import type { Room } from '@/features/admin/types'
import type { GenerateSeatsPayload } from '@/features/showtime/types'

interface AdminSeatConfigModalProps {
  room: Room
  onClose: () => void
  onSuccess: (totalSeatsGenerated: number) => void
}

export default function AdminSeatConfigModal({ room, onClose, onSuccess }: AdminSeatConfigModalProps) {
  const [rowCount, setRowCount] = useState<number>(10)
  const [colsPerRow, setColsPerRow] = useState<number>(12)
  const [vipRowStart, setVipRowStart] = useState<number>(3)
  const [vipRowEnd, setVipRowEnd] = useState<number>(7)
  const [coupleRowLast, setCoupleRowLast] = useState<boolean>(true)

  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const totalCalculated = rowCount * colsPerRow

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rowCount < 1 || rowCount > 26 || colsPerRow < 1 || colsPerRow > 30) {
      setError('Số hàng phải từ 1-26 (A-Z) và số ghế từ 1-30')
      return
    }

    setSubmitting(true)
    setError(null)

    const payload: GenerateSeatsPayload = {
      rowCount: Number(rowCount),
      colsPerRow: Number(colsPerRow),
      vipRowStart: Number(vipRowStart),
      vipRowEnd: Number(vipRowEnd),
      coupleRowLast,
    }

    try {
      const response = await api.post<ApiResponse<{ totalSeatsGenerated: number }>>(
        `/v1/admin/rooms/${room.id}/seats`,
        payload
      )
      if (response.data.status === 'SUCCESS' && response.data.data) {
        onSuccess(response.data.data.totalSeatsGenerated)
      } else {
        setError(response.data.message || 'Không thể sinh sơ đồ ghế')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo sơ đồ ghế cho phòng')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#12172B]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1B2140] border border-[#2A3157] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 relative marquee-glow">
        <div className="flex items-center justify-between border-b border-[#2A3157] pb-3">
          <div>
            <h3 className="font-display font-bold text-lg text-[#F2EFE6]">
              Cấu Hình Sơ Đồ Ghế - {room.name}
            </h3>
            <p className="text-[11px] text-[#B7BAC9]">Tạo danh sách ghế tự động theo hàng (A-Z) và loại ghế</p>
          </div>
          <button onClick={onClose} className="text-[#B7BAC9] hover:text-[#F2EFE6] cursor-pointer">✕</button>
        </div>

        {error && (
          <div className="p-3 bg-[#C1443F]/15 border border-[#C1443F]/40 text-[#F2EFE6] text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#B7BAC9] mb-1 font-medium">Số hàng ghế (A - Z) *</label>
              <input
                type="number"
                required
                min={1}
                max={26}
                value={rowCount}
                onChange={e => setRowCount(Number(e.target.value))}
                className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none font-mono"
              />
              <span className="text-[10px] text-[#565B72] block mt-0.5">Ví dụ: 10 hàng (A-J)</span>
            </div>

            <div>
              <label className="block text-[#B7BAC9] mb-1 font-medium">Số ghế mỗi hàng *</label>
              <input
                type="number"
                required
                min={1}
                max={30}
                value={colsPerRow}
                onChange={e => setColsPerRow(Number(e.target.value))}
                className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-3 py-2 rounded-lg focus:border-[#E8A33D] focus:outline-none font-mono"
              />
              <span className="text-[10px] text-[#565B72] block mt-0.5">Ví dụ: 12 ghế/hàng</span>
            </div>
          </div>

          <div className="bg-[#0D1120] p-3.5 rounded-xl border border-[#2A3157] space-y-3">
            <span className="font-semibold text-[#E8A33D] block text-xs">Cấu Hình Ghế VIP</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#B7BAC9] mb-1 text-[11px]">Hàng bắt đầu VIP</label>
                <input
                  type="number"
                  min={1}
                  max={rowCount}
                  value={vipRowStart}
                  onChange={e => setVipRowStart(Number(e.target.value))}
                  className="w-full bg-[#1B2140] border border-[#2A3157] text-[#F2EFE6] px-3 py-1.5 rounded-lg focus:border-[#E8A33D] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[#B7BAC9] mb-1 text-[11px]">Hàng kết thúc VIP</label>
                <input
                  type="number"
                  min={1}
                  max={rowCount}
                  value={vipRowEnd}
                  onChange={e => setVipRowEnd(Number(e.target.value))}
                  className="w-full bg-[#1B2140] border border-[#2A3157] text-[#F2EFE6] px-3 py-1.5 rounded-lg focus:border-[#E8A33D] focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#0D1120] p-3.5 rounded-xl border border-[#2A3157] flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#F2EFE6] block text-xs">Ghế Đôi (COUPLE)</span>
              <span className="text-[10px] text-[#B7BAC9]">Hàng cuối cùng sẽ là loại ghế đôi</span>
            </div>
            <input
              type="checkbox"
              checked={coupleRowLast}
              onChange={e => setCoupleRowLast(e.target.checked)}
              className="w-4 h-4 accent-[#E8A33D] cursor-pointer"
            />
          </div>

          <div className="bg-[#1B2140] p-3 rounded-lg border border-[#2A3157] flex items-center justify-between text-xs font-mono">
            <span className="text-[#B7BAC9]">Tổng số ghế sẽ sinh:</span>
            <span className="text-[#E8A33D] font-bold text-sm">{totalCalculated} Ghế</span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#0D1120] text-[#B7BAC9] border border-[#2A3157] px-4 py-2 rounded-lg hover:text-[#F2EFE6] cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#E8A33D] hover:bg-[#F2B655] text-[#12172B] font-semibold px-5 py-2 rounded-lg cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Đang Khởi Tạo...' : 'Sinh Sơ Đồ Ghế'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
