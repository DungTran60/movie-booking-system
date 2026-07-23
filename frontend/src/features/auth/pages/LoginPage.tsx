import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '@/services/api'
import { decodeJwt } from '@/utils/jwt'
import { useAuth } from '@/context/AuthContext'
import type { ApiResponse } from '@/types'
import type { AuthResponse } from '@/features/auth/types'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { login: authLogin } = useAuth()

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!email) {
      newErrors.email = 'Vui lòng nhập Email'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ'
    }
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setErrors({})

    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/v1/auth/login', {
        email,
        password,
      })

      const envelope = response.data
      if (envelope.status === 'SUCCESS' && envelope.data) {
        const { accessToken, refreshToken } = envelope.data
        authLogin(accessToken, refreshToken)

        const decoded = decodeJwt(accessToken)
        const role = decoded?.role || 'CUSTOMER'

        if (role === 'ADMIN' || role === 'STAFF') {
          navigate('/dashboard')
        } else {
          navigate('/')
        }
      }
 else {
        setErrors({ form: envelope.message || 'Đăng nhập thất bại' })
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Email hoặc mật khẩu không chính xác'
      setErrors({ form: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-[#F2EFE6] mb-2 text-center">
        Đăng Nhập
      </h2>
      <p className="text-[#B7BAC9] text-xs text-center mb-6">
        Nhập thông tin tài khoản để đặt vé và xem lịch chiếu
      </p>
      
      {errors.form && (
        <div className="mb-5 p-3.5 bg-[#C1443F]/15 border border-[#C1443F]/40 text-[#F2EFE6] text-xs rounded-lg flex items-center gap-2">
          <span>⚠️</span>
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#B7BAC9] mb-1.5 uppercase tracking-wider" htmlFor="email">
            Địa chỉ Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`w-full px-4 py-2.5 bg-[#0D1120] border text-[#F2EFE6] placeholder-[#565B72] text-sm rounded-lg focus:outline-none focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D] transition-all ${
              errors.email ? 'border-[#C1443F]' : 'border-[#2A3157]'
            }`}
            placeholder="ten@example.com"
          />
          {errors.email && <p className="text-[#C1443F] text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-medium text-[#B7BAC9] uppercase tracking-wider" htmlFor="password">
              Mật khẩu
            </label>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`w-full px-4 py-2.5 bg-[#0D1120] border text-[#F2EFE6] placeholder-[#565B72] text-sm rounded-lg focus:outline-none focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D] transition-all ${
              errors.password ? 'border-[#C1443F]' : 'border-[#2A3157]'
            }`}
            placeholder="••••••••"
          />
          {errors.password && <p className="text-[#C1443F] text-xs mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-[#E8A33D] hover:bg-[#F2B655] active:translate-y-[1px] text-[#12172B] font-semibold py-3 px-4 rounded-lg transition-all shadow-md shadow-[#E8A33D]/10 focus:outline-none disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span className="inline-block animate-spin">⏳</span>
          ) : (
            <span>Vào Rạp Xem Phim →</span>
          )}
        </button>
      </form>

      <div className="ticket-divider my-6" />

      <div className="text-center text-xs text-[#B7BAC9]">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-[#E8A33D] hover:text-[#F2B655] font-semibold transition-colors underline underline-offset-4">
          Đăng ký vé mới ngay
        </Link>
      </div>
    </div>
  )
}
