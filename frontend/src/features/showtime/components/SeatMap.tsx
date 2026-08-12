import { useState } from 'react'
import type { ShowtimeSeat } from '../types'

interface SeatMapProps {
  seats: ShowtimeSeat[]
  onSeatSelectChange?: (selectedSeats: ShowtimeSeat[]) => void
}

export default function SeatMap({ seats, onSeatSelectChange }: SeatMapProps) {
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([])

  // Group seats by rowCode
  const rowCodes = Array.from(new Set(seats.map(s => s.rowCode))).sort()

  const handleSeatClick = (seat: ShowtimeSeat) => {
    if (seat.status === 'BOOKED' || seat.status === 'LOCKED') {
      return // Cannot select booked or locked seats
    }

    const exists = selectedSeatIds.includes(seat.id)
    let newSelected: number[]
    if (exists) {
      newSelected = selectedSeatIds.filter(id => id !== seat.id)
    } else {
      newSelected = [...selectedSeatIds, seat.id]
    }
    setSelectedSeatIds(newSelected)

    if (onSeatSelectChange) {
      const selectedObjects = seats.filter(s => newSelected.includes(s.id))
      onSeatSelectChange(selectedObjects)
    }
  }

  const selectedSeatsList = seats.filter(s => selectedSeatIds.includes(s.id))
  const totalPrice = selectedSeatsList.reduce((sum, s) => sum + Number(s.price), 0)

  return (
    <div className="bg-[#12172B] border border-[#2A3157] rounded-xl p-6 space-y-8 shadow-2xl">
      {/* Curved Screen Indicator */}
      <div className="relative text-center space-y-2">
        <div className="w-4/5 mx-auto h-3 bg-gradient-to-b from-[#E8A33D] to-transparent rounded-t-[100%] opacity-80 shadow-[0_0_15px_#E8A33D]" />
        <div className="text-[11px] font-display font-bold text-[#E8A33D] tracking-widest uppercase">
          MÀN HÌNH CHÍNH
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 py-3 bg-[#1B2140] border border-[#2A3157] rounded-lg text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-[#1B2140] border border-[#2A3157] rounded flex items-center justify-center text-[10px] text-[#B7BAC9]">
            A1
          </div>
          <span className="text-[#B7BAC9]">Trống</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-[#E8A33D] text-[#12172B] font-bold rounded flex items-center justify-center text-[10px]">
            A1
          </div>
          <span className="text-[#E8A33D] font-medium">Đang chọn</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-[#E8A33D]/20 border border-[#E8A33D] text-[#E8A33D] rounded flex items-center justify-center text-[10px] font-bold">
            K
          </div>
          <span className="text-[#E8A33D]">Đang giữ</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-[#8C2F3A]/40 border border-[#8C2F3A] text-[#B7BAC9] rounded flex items-center justify-center text-[10px]">
            ✕
          </div>
          <span className="text-[#8C2F3A]">Đã bán</span>
        </div>

        <div className="flex items-center gap-1.5 border-l border-[#2A3157] pl-3">
          <div className="w-5 h-5 bg-[#1B2140] border-2 border-[#E8A33D] rounded flex items-center justify-center text-[9px] font-bold text-[#E8A33D]">
            VIP
          </div>
          <span className="text-[#E8A33D]">Ghế VIP</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-8 h-5 bg-[#1B2140] border border-[#2A3157] rounded-full flex items-center justify-center text-[9px] text-[#E8A33D]">
            2x
          </div>
          <span className="text-[#F2EFE6]">Ghế Đôi</span>
        </div>
      </div>

      {/* Seat Map Grid */}
      <div className="overflow-x-auto py-2">
        <div className="min-w-[500px] flex flex-col items-center gap-3">
          {rowCodes.map(rowCode => {
            const rowSeats = seats
              .filter(s => s.rowCode === rowCode)
              .sort((a, b) => a.seatNumber - b.seatNumber)

            return (
              <div key={rowCode} className="flex items-center gap-2">
                {/* Row Code Label Left */}
                <div className="w-6 text-center font-mono font-bold text-[#E8A33D] text-xs">
                  {rowCode}
                </div>

                {/* Seat Buttons */}
                <div className="flex items-center gap-1.5">
                  {rowSeats.map(seat => {
                    const isSelected = selectedSeatIds.includes(seat.id)
                    const isBooked = seat.status === 'BOOKED'
                    const isLocked = seat.status === 'LOCKED'
                    const isVip = seat.seatType === 'VIP'
                    const isCouple = seat.seatType === 'COUPLE'

                    let seatStyle = 'bg-[#1B2140] text-[#B7BAC9] border-[#2A3157] hover:border-[#E8A33D] hover:text-[#F2EFE6]'

                    if (isSelected) {
                      seatStyle = 'bg-[#E8A33D] text-[#12172B] border-[#E8A33D] font-bold shadow-lg shadow-[#E8A33D]/20 scale-105'
                    } else if (isBooked) {
                      seatStyle = 'bg-[#8C2F3A]/40 text-[#565B72] border-[#8C2F3A] cursor-not-allowed line-through opacity-70'
                    } else if (isLocked) {
                      seatStyle = 'bg-[#E8A33D]/20 text-[#E8A33D] border-[#E8A33D] cursor-not-allowed'
                    } else if (isVip) {
                      seatStyle = 'bg-[#1B2140] text-[#E8A33D] border-2 border-[#E8A33D] hover:bg-[#E8A33D]/10'
                    }

                    return (
                      <button
                        key={seat.id}
                        disabled={isBooked || isLocked}
                        onClick={() => handleSeatClick(seat)}
                        title={`${rowCode}${seat.seatNumber} (${seat.seatType}) - ${Number(seat.price).toLocaleString('vi-VN')} đ`}
                        className={`transition-all cursor-pointer flex items-center justify-center font-mono text-[10px] ${
                          isCouple ? 'w-14 h-7 rounded-full' : 'w-7 h-7 rounded-md'
                        } border ${seatStyle}`}
                      >
                        {isBooked ? '✕' : isLocked ? 'K' : isSelected ? '✓' : `${rowCode}${seat.seatNumber}`}
                      </button>
                    )
                  })}
                </div>

                {/* Row Code Label Right */}
                <div className="w-6 text-center font-mono font-bold text-[#E8A33D] text-xs">
                  {rowCode}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-[#1B2140] border border-[#2A3157] p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <span className="text-[#B7BAC9]">Ghế đang chọn: </span>
          {selectedSeatsList.length === 0 ? (
            <span className="text-[#565B72] italic">Chưa chọn ghế nào</span>
          ) : (
            <div className="inline-flex flex-wrap gap-1 ml-2">
              {selectedSeatsList.map(s => (
                <span key={s.id} className="px-2 py-0.5 bg-[#E8A33D] text-[#12172B] font-bold rounded text-[11px]">
                  {s.rowCode}{s.seatNumber}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#B7BAC9]">Tạm tính:</span>
          <span className="font-mono font-bold text-lg text-[#E8A33D]">
            {totalPrice.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>
    </div>
  )
}
