"use client"

import { useAuth } from "@/hooks/use-auth-store"

export function BankView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-[#0b0f17] flex flex-col flex-1 pb-10">
      <div className="h-[44px] w-full flex mb-5 shadow-[0_1px_6px_#132235] px-2.5 flex-shrink-0 !shadow-none">
        <div className="w-[30px] flex-shrink-0 flex items-center justify-start cursor-pointer" onClick={onBack}>
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" className="text-white" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"></path>
          </svg>
        </div>
        <div className="w-full flex-1 flex justify-center items-center text-xl text-white h-full">
          <p className="leading-none">Thêm ngân hàng</p>
        </div>
        <div className="w-[30px] flex-shrink-0 flex items-center"></div>
      </div>

      <div className="px-[12px]">
        <div className="bg-white py-[10px] rounded-[8px] px-[12px] overflow-hidden font-[500] text-[14px] text-[#333]">
          <p>Tên ngân hàng: Vietcombank</p>
          <p>Số tài khoản: ****12332</p>
          <p>Chủ tài khoản: {user?.fullName || 'Nguyen Van Anh'}</p>
        </div>
      </div>
    </div>
  )
}
