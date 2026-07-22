import { Outlet, Link } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#12172B] text-[#F2EFE6] font-body flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Marquee Ambient Lights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#E8A33D]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#8C2F3A]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-[#E8A33D] flex items-center justify-center text-[#12172B] font-display font-bold text-xl shadow-lg shadow-[#E8A33D]/20 group-hover:scale-105 transition-transform">
            🍿
          </div>
          <span className="font-display text-3xl font-semibold tracking-wide text-[#F2EFE6] group-hover:text-[#E8A33D] transition-colors">
            Cine<span className="text-[#E8A33D]">Ticket</span>
          </span>
        </Link>
        <p className="text-[#B7BAC9] text-xs mt-1 tracking-wider uppercase font-medium">
          Trải nghiệm điện ảnh đỉnh cao
        </p>
      </div>

      {/* Ticket Container Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#1B2140] rounded-xl border border-[#2A3157] p-8 shadow-2xl relative marquee-glow">
          {/* Decorative Ticket Perforation Sockets */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#12172B] border-r border-[#2A3157] rounded-full" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#12172B] border-l border-[#2A3157] rounded-full" />

          <Outlet />
        </div>
      </div>

      {/* Footer copyright */}
      <div className="mt-8 text-center text-[#565B72] text-xs">
        © 2026 CineTicket System. Tất cả quyền được bảo lưu.
      </div>
    </div>
  )
}
