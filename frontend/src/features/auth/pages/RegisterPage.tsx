import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '@/services/api'
import type { ApiResponse } from '@/types'

interface RegisterError {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [errors, setErrors] = useState<RegisterError>({})
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()

  const validate = () => {
    const newErrors: RegisterError = {}
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống'
    }
    
    if (!email) {
      newErrors.email = 'Email không được để trống'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không đúng định dạng'
    }
    
    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống'
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải từ 6 ký tự'
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setErrors({})
    setSuccessMsg('')

    try {
      const response = await api.post<ApiResponse<any>>('/v1/auth/register', {
        fullName,
        email,
        phone: phone || null,
        password,
      })

      const envelope = response.data
      if (envelope.status === 'SUCCESS') {
        setSuccessMsg('Tạo tài khoản thành công! Đang chuyển đến trang Đăng nhập...')
        setTimeout(() => {
          navigate('/login')
        }, 1800)
      } else {
        if (envelope.errors && envelope.errors.length > 0) {
          const fieldErrors: RegisterError = {}
          envelope.errors.forEach(err => {
            const field = err.field as keyof RegisterError
            if (field) {
              fieldErrors[field] = err.message
            }
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ form: envelope.message || 'Đăng ký không thành công' })
        }
      }
    } catch (error: any) {
      const serverResponse = error.response?.data
      if (serverResponse && serverResponse.errors && serverResponse.errors.length > 0) {
        const fieldErrors: RegisterError = {}
        serverResponse.errors.forEach((err: any) => {
          const field = err.field as keyof RegisterError
          if (field) {
            fieldErrors[field] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ form: serverResponse?.message || 'Email hoặc số điện thoại đã tồn tại trong hệ thống' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-[#F2EFE6] mb-2 text-center">
        Tạo Tài Khoản
      </h2>
      <p className="text-[#B7BAC9] text-xs text-center mb-6">
        Đăng ký thành viên CineTicket để nhận ưu đãi vé phim
      </p>

      {successMsg && (
        <div className="mb-5 p-3.5 bg-[#5FA777]/15 border border-[#5FA777]/40 text-[#F2EFE6] text-xs rounded-lg flex items-center gap-2">
          <span>🎉</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errors.form && (
        <div className="mb-5 p-3.5 bg-[#C1443F]/15 border border-[#C1443F]/40 text-[#F2EFE6] text-xs rounded-lg flex items-center gap-2">
          <span>⚠️</span>
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-[#B7BAC9] mb-1 uppercase tracking-wider" htmlFor="fullName">
            Họ và tên
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className={`w-full px-4 py-2 bg-[#0D1120] border text-[#F2EFE6] placeholder-[#565B72] text-sm rounded-lg focus:outline-none focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D] transition-all ${
              errors.fullName ? 'border-[#C1443F]' : 'border-[#2A3157]'
            }`}
            placeholder="Nguyễn Văn A"
          />
          {errors.fullName && <p className="text-[#C1443F] text-xs mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#B7BAC9] mb-1 uppercase tracking-wider" htmlFor="email">
            Địa chỉ Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`w-full px-4 py-2 bg-[#0D1120] border text-[#F2EFE6] placeholder-[#565B72] text-sm rounded-lg focus:outline-none focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D] transition-all ${
              errors.email ? 'border-[#C1443F]' : 'border-[#2A3157]'
            }`}
            placeholder="ten@example.com"
          />
          {errors.email && <p className="text-[#C1443F] text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#B7BAC9] mb-1 uppercase tracking-wider" htmlFor="phone">
            Số điện thoại
          </label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className={`w-full px-4 py-2 bg-[#0D1120] border text-[#F2EFE6] placeholder-[#565B72] text-sm rounded-lg focus:outline-none focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D] transition-all ${
              errors.phone ? 'border-[#C1443F]' : 'border-[#2A3157]'
            }`}
            placeholder="0912345678"
          />
          {errors.phone && <p className="text-[#C1443F] text-xs mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#B7BAC9] mb-1 uppercase tracking-wider" htmlFor="password">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`w-full px-4 py-2 bg-[#0D1120] border text-[#F2EFE6] placeholder-[#565B72] text-sm rounded-lg focus:outline-none focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D] transition-all ${
              errors.password ? 'border-[#C1443F]' : 'border-[#2A3157]'
            }`}
            placeholder="••••••••"
          />
          {errors.password && <p className="text-[#C1443F] text-xs mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#B7BAC9] mb-1 uppercase tracking-wider" htmlFor="confirmPassword">
            Xác nhận mật khẩu
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className={`w-full px-4 py-2 bg-[#0D1120] border text-[#F2EFE6] placeholder-[#565B72] text-sm rounded-lg focus:outline-none focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D] transition-all ${
              errors.confirmPassword ? 'border-[#C1443F]' : 'border-[#2A3157]'
            }`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="text-[#C1443F] text-xs mt-1">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 bg-[#E8A33D] hover:bg-[#F2B655] active:translate-y-[1px] text-[#12172B] font-semibold py-3 px-4 rounded-lg transition-all shadow-md shadow-[#E8A33D]/10 focus:outline-none disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span className="inline-block animate-spin">⏳</span>
          ) : (
            <span>Hoàn Tất Đăng Ký 🎟️</span>
          )}
        </button>
      </form>

      <div className="ticket-divider my-5" />

      <div className="text-center text-xs text-[#B7BAC9]">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-[#E8A33D] hover:text-[#F2B655] font-semibold transition-colors underline underline-offset-4">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  )
}
