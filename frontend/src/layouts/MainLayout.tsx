import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function MainLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/dashboard')

  return (
    <div className="min-h-screen bg-[#12172B] text-[#F2EFE6] flex flex-col font-body">
      {/* Navigation Header - Hidden on Admin Dashboard pages */}
      {!isAdminPage && (
        <header className="bg-[#1B2140] border-b border-[#2A3157] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="w-8 h-8 rounded-lg bg-[#E8A33D] flex items-center justify-center text-[#12172B] font-bold font-display text-sm">
                CT
              </span>
              <span className="font-display text-2xl font-semibold tracking-wide text-[#F2EFE6] group-hover:text-[#E8A33D] transition-colors">
                Cine<span className="text-[#E8A33D]">Ticket</span>
              </span>
            </Link>

            <nav className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded bg-[#0D1120] text-[#E8A33D] border border-[#2A3157] font-mono font-medium">
                    {user?.role || 'USER'}
                  </span>
                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/dashboard"
                      className="text-xs text-[#E8A33D] hover:underline font-medium"
                    >
                      Quản trị
                    </Link>
                  )}
                  <button
                    onClick={() => logout()}
                    className="bg-[#8C2F3A] hover:bg-[#A63530] text-[#F2EFE6] text-xs font-semibold py-1.5 px-3.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Đăng Xuất
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-xs text-[#B7BAC9] hover:text-[#E8A33D] font-medium px-3 py-1.5 transition-colors"
                  >
                    Đăng Nhập
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#E8A33D] hover:bg-[#F2B655] text-[#12172B] text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all"
                  >
                    Đăng Ký
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </header>
      )}

      {/* Main Page Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#0D1120] border-t border-[#2A3157] py-6 text-center text-xs text-[#565B72] mt-auto">
        © {new Date().getFullYear()} CineTicket System — Trải nghiệm điện ảnh đỉnh cao.
      </footer>
    </div>
  )
}
