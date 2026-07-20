import { Outlet } from 'react-router-dom'

// Shared header/footer components sẽ được thêm sau
export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-600">🎬 MovieBooking</span>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} MovieBooking System
      </footer>
    </div>
  )
}
