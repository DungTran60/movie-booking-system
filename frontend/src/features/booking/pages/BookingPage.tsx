import { useParams } from 'react-router-dom'

export default function BookingPage() {
  const { showtimeId } = useParams()
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Đặt vé</h1>
      <p className="text-gray-500">Suất chiếu: {showtimeId}</p>
    </div>
  )
}
