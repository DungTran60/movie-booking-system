import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#12172B] text-[#F2EFE6] flex flex-col items-center justify-center p-4">
      <div className="bg-[#1B2140] border border-[#2A3157] rounded-xl p-8 max-w-md w-full text-center shadow-2xl relative marquee-glow">
        <div className="text-6xl mb-4">⛔</div>
        <h1 className="font-display text-3xl font-bold text-[#F2EFE6] mb-2">403 - Forbidden</h1>
        <p className="text-[#B7BAC9] text-sm mb-6">
          Bạn không có quyền truy cập vào khu vực này. Vui lòng liên hệ quản trị viên hoặc quay về trang chủ.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#E8A33D] hover:bg-[#F2B655] text-[#12172B] font-semibold py-2.5 px-6 rounded-lg transition-all"
        >
          Quay Về Trang Chủ
        </Link>
      </div>
    </div>
  )
}
