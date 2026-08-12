import { Outlet, Link } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#12172B] text-[#F2EFE6] flex flex-col justify-center items-center p-4 font-body relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E8A33D]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Container */}
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="w-9 h-9 rounded-xl bg-[#E8A33D] flex items-center justify-center text-[#12172B] font-bold font-display text-base">
              CT
            </span>
            <span className="font-display text-3xl font-bold tracking-wide text-[#F2EFE6] group-hover:text-[#E8A33D] transition-colors">
              Cine<span className="text-[#E8A33D]">Ticket</span>
            </span>
          </Link>
          <p className="text-xs text-[#B7BAC9]">Hệ Thống Đặt Vé Phim Chiếu Rạp Trực Tuyến</p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-[#1B2140] border border-[#2A3157] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm marquee-glow">
          <Outlet />
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-[#565B72]">
          © {new Date().getFullYear()} CineTicket System. Bảo mật & An toàn.
        </div>
      </div>
    </div>
  )
}
