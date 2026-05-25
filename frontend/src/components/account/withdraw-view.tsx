"use client"

import { useState } from 'react'
import { useAuth } from "@/hooks/use-auth-store"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

export function WithdrawView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [money, setMoney] = useState("")
  const [passwordV2, setPasswordV2] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!money || !passwordV2) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập đầy đủ thông tin" })
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/transaction/withdraw', {
        money: parseFloat(money),
        passwordV2
      })

      if (response.data && response.data.status) {
        toast({ title: "Thành công", description: "Yêu cầu rút tiền đã được gửi." })
        onBack()
      } else {
        toast({ variant: "destructive", title: "Lỗi", description: response.data?.message || "Gửi yêu cầu thất bại" })
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Lỗi kết nối", description: err.response?.data?.message || "Không thể kết nối đến máy chủ" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] max-w-[560px] mx-auto main-layout">
      <div className="min-h-screen bg-[#0b0f17]">
        {/* Header */}
        <div className="h-[44px] w-full flex mb-5 shadow-[0_1px_6px_#132235] px-2.5 flex-shrink-0 !shadow-none">
          <div
            className="w-[30px] flex-shrink-0 flex items-center justify-start cursor-pointer"
            onClick={onBack}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 320 512"
              className="text-white"
              height="18"
              width="18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"></path>
            </svg>
          </div>
          <div className="w-full flex-1 flex justify-center items-center text-xl text-white h-full">
            <p className="leading-none">Rút Tiền</p>
          </div>
          <div className="w-[30px] flex-shrink-0 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-credit-card w-5 h-5 text-white"
              aria-hidden="true"
            >
              <rect width="20" height="14" x="2" y="5" rx="2"></rect>
              <line x1="2" x2="22" y1="10" y2="10"></line>
            </svg>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
          {/* Amount Section */}
          <div className="p-4 bg-white rounded-t-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600 font-medium uppercase tracking-tight">Số Dư Khả Dụng</span>
              <span className="text-xl font-black text-blue-600">{(user?.money || 0).toLocaleString()} USDT</span>
            </div>
            <div className="relative">
              <div className="absolute text-lg text-gray-400 transform -translate-y-1/2 left-4 top-1/2 font-bold">$</div>
              <input
                type="number"
                value={money}
                onChange={(e) => setMoney(e.target.value)}
                placeholder="Vui Lòng Nhập Số Tiền Rút"
                className="w-full py-4 pl-12 pr-4 text-lg font-bold text-gray-800 placeholder-gray-400 bg-transparent border-0 focus:outline-none"
              />
            </div>
            <div className="border-b border-gray-100"></div>
          </div>

          {/* Password Section */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <p className="text-xs text-gray-400 mb-2 uppercase font-bold tracking-widest">Mật khẩu giao dịch</p>
            <input
              type="password"
              value={passwordV2}
              onChange={(e) => setPasswordV2(e.target.value)}
              placeholder="Nhập mật khẩu thanh toán"
              className="w-full py-2 text-base text-gray-800 placeholder-gray-400 bg-transparent border-0 focus:outline-none font-bold"
            />
            <div className="border-b border-gray-100"></div>
          </div>

          {/* Fee Section */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-red-600 uppercase text-xs tracking-tighter">Phí Xử Lý</span>
              <span className="px-2 py-1 text-sm font-black text-gray-800 bg-gray-100 rounded">0%</span>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-500 font-medium">
              Đối với các giao dịch rút tiền hiện tại của bạn, phí xử lý sẽ được khấu trừ vào số tiền rút. Nếu gặp khó khăn, vui lòng liên hệ CSKH.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffc107] hover:bg-[#e0a800] active:scale-95 disabled:opacity-50 text-black font-black py-5 px-6 rounded-xl transition-all uppercase tracking-[0.2em] text-lg shadow-lg shadow-yellow-500/20"
            >
              {loading ? "Đang xử lý..." : "Xác nhận rút tiền"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
