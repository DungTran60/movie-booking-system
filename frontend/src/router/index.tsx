import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'

// ProtectedRoute component
import ProtectedRoute from '@/components/ProtectedRoute'

// Feature pages
import HomePage from '@/features/movie/pages/HomePage'
import MovieDetailPage from '@/features/movie/pages/MovieDetailPage'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import UnauthorizedPage from '@/features/auth/pages/UnauthorizedPage'
import BookingPage from '@/features/booking/pages/BookingPage'
import PaymentPage from '@/features/payment/pages/PaymentPage'
import TicketsPage from '@/features/ticket/pages/TicketsPage'
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage'
import ShowtimeSelectionPage from '@/features/showtime/pages/ShowtimeSelectionPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Main layout routes */}
        <Route element={<MainLayout />}>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/movies/:slug" element={<MovieDetailPage />} />
          <Route path="/showtimes" element={<ShowtimeSelectionPage />} />

          {/* Customer protected routes */}
          <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'STAFF']} />}>
            <Route path="/booking/:showtimeId" element={<BookingPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
          </Route>

          {/* Admin / Staff protected dashboard route */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF']} />}>
            <Route path="/dashboard" element={<AdminDashboardPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
