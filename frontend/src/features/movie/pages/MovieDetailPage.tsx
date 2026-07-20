import { useParams } from 'react-router-dom'

export default function MovieDetailPage() {
  const { id } = useParams()
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Chi tiết phim</h1>
      <p className="text-gray-500">ID: {id}</p>
    </div>
  )
}
