import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

interface ProtectedRouteProps {
  allowedRoles?: string[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#12172B] flex items-center justify-center text-[#E8A33D]">
        <div className="flex flex-col items-center gap-3">
          <span className="text-3xl animate-spin">⏳</span>
          <span className="text-xs uppercase tracking-widest text-[#B7BAC9]">Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = role && allowedRoles.includes(role)
    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <Outlet />
}

export default ProtectedRoute
