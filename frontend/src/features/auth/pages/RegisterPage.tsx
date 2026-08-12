import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/services/api'
import type { ApiResponse } from '@/types'
import type { AuthResponse } from '@/features/auth/types'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự')
      return
    }

    setLoading(true)
    setError(null)

    const payload = {
      fullName,
      email,
      password,
      phone: phone || undefined,
    }

    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/v1/auth/register', payload)
      const envelope = response.data

      if (envelope.status === 'SUCCESS') {
        setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng sang Đăng Nhập...')
        setTimeout(() => {
          navigate('/login')
        }, 1500)
      } else {
        setError(envelope.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.')
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại sau.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-display text-2xl font-bold text-[#F2EFE6]">Đăng Ký Tài Khoản</h2>
        <p className="text-xs text-[#B7BAC9]">Tạo tài khoản để trải nghiệm đặt vé nhanh chóng</p>
      </div>

      {success && (
        <div className="p-3.5 bg-[#5FA777]/15 border border-[#5FA777]/40 text-[#F2EFE6] text-xs rounded-xl flex items-center justify-between">
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-[#C1443F]/15 border border-[#C1443F]/40 text-[#F2EFE6] text-xs rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-[#C1443F] font-bold cursor-pointer">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label className="block text-[#B7BAC9] font-medium mb-1">Họ và tên *</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-4 py-2.5 rounded-xl focus:border-[#E8A33D] focus:outline-none"
            placeholder="Nguyễn Văn A"
          />
        </div>

        <div>
          <label className="block text-[#B7BAC9] font-medium mb-1">Địa chỉ Email *</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-4 py-2.5 rounded-xl focus:border-[#E8A33D] focus:outline-none"
            placeholder="example@gmail.com"
          />
        </div>

        <div>
          <label className="block text-[#B7BAC9] font-medium mb-1">Số điện thoại</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-4 py-2.5 rounded-xl focus:border-[#E8A33D] focus:outline-none font-mono"
            placeholder="0901234567"
          />
        </div>

        <div>
          <label className="block text-[#B7BAC9] font-medium mb-1">Mật khẩu *</label>
          <input
            type="password"
            required
            min={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-4 py-2.5 rounded-xl focus:border-[#E8A33D] focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-[#B7BAC9] font-medium mb-1">Xác nhận mật khẩu *</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full bg-[#0D1120] border border-[#2A3157] text-[#F2EFE6] px-4 py-2.5 rounded-xl focus:border-[#E8A33D] focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#E8A33D] hover:bg-[#F2B655] text-[#12172B] font-bold py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#E8A33D]/20 disabled:opacity-50 mt-2"
        >
          {loading ? 'Đang Xử Lý...' : 'Hoàn Tất Đăng Ký'}
        </button>
      </form>

      <div className="text-center text-xs text-[#B7BAC9] pt-2 border-t border-[#2A3157]">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-[#E8A33D] font-semibold hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  )
}
