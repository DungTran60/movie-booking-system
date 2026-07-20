import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-3xl font-bold text-indigo-600">🎬 MovieBooking</span>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
