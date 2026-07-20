import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'

// Feature pages (lazy loaded later - placeholder imports for now)
import HomePage from '@/features/movie/pages/HomePage'
import MovieDetailPage from '@/features/movie/pages/MovieDetailPage'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import BookingPage from '@/features/booking/pages/BookingPage'
import PaymentPage from '@/features/payment/pages/PaymentPage'
import TicketsPage from '@/features/ticket/pages/TicketsPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - Auth layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Main routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/booking/:showtimeId" element={<BookingPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
