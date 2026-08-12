import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'
import { decodeJwt } from '@/utils/jwt'
import type { ApiResponse } from '@/types'
import type { AuthResponse } from '@/features/auth/types'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect path after login (from ProtectedRoute)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/v1/auth/login', { email, password })
      const envelope = response.data

      if (envelope.status === 'SUCCESS' && envelope.data) {
        const { accessToken, refreshToken } = envelope.data
        login(accessToken, refreshToken)

        const decoded = decodeJwt(accessToken)
        const userRole = decoded?.role || 'CUSTOMER'

        if (userRole === 'ADMIN' || userRole === 'STAFF') {
          navigate('/dashboard', { replace: true })
        } else {
          navigate(from, { replace: true })
        }
      } else {
        setError(envelope.message || 'Đăng nhập thất bại')
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.')
      } else if (err.response?.status === 401) {
        setError('Địa chỉ Email hoặc Mật khẩu không chính xác')
      } else {
        setError(err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-display text-2xl font-bold text-[#F2EFE6]">Đăng Nhập Tài Khoản</h2>
        <p className="text-xs text-[#B7BAC9]">Nhập thông tin đăng nhập để tiếp tục</p>
      </div>

      {error && (
        <div className="p-3.5 bg-[#C1443F]/15 border border-[#C1443F]/40 text-[#F2EFE6] text-xs rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-[#C1443F] font-bold cursor-pointer">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-[#B7BAC9] font-medium mb-1.5">Địa chỉ Email *</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-4 py-2.5 rounded-xl focus:border-[#E8A33D] focus:outline-none transition-colors"
            placeholder="admin@moviebooking.com"
          />
        </div>

        <div>
          <label className="block text-[#B7BAC9] font-medium mb-1.5">Mật khẩu *</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-4 py-2.5 rounded-xl focus:border-[#E8A33D] focus:outline-none transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#E8A33D] hover:bg-[#F2B655] text-[#12172B] font-bold py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#E8A33D]/20 disabled:opacity-50 mt-2"
        >
          {loading ? 'Đang Đăng Nhập...' : 'Đăng Nhập'}
        </button>
      </form>

      <div className="text-center text-xs text-[#B7BAC9] pt-2 border-t border-[#2A3157]">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-[#E8A33D] font-semibold hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  )
}
