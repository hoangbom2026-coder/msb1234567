"use client"

import { useState } from 'react'
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

const depositSchema = z.object({
  money: z.string().min(1, "Vui lòng nhập số tiền"),
  image: z.any().optional()
})

type DepositFormValues = z.infer<typeof depositSchema>

export function DepositView({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema)
  })

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue('image', file)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (values: DepositFormValues) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('money', values.money)
      formData.append('type', 'bank')
      if (values.image) {
        formData.append('proof', values.image)
      }

      const response = await api.post('/transaction/recharge', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data && response.data.status) {
        toast({ title: "Thành công", description: "Yêu cầu nạp tiền đã được gửi. Vui lòng chờ duyệt." })
        onBack()
      } else {
        toast({ variant: "destructive", title: "Lỗi", description: response.data.message || "Gửi yêu cầu thất bại" })
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Lỗi kết nối", description: err.response?.data?.message || "Không thể kết nối đến máy chủ" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen h-full bg-[#0b0f17]">
      {/* Header */}
      <div className="h-[44px] w-full flex mb-5 shadow-[0_1px_6px_#132235] px-2.5 flex-shrink-0 !shadow-none">
        <div className="w-[30px] flex-shrink-0 flex items-center justify-start cursor-pointer" onClick={onBack}>
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" className="text-white" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"></path>
          </svg>
        </div>
        <div className="w-full flex-1 flex justify-center items-center text-xl text-white h-full">
          <p className="leading-none">Nạp tiền</p>
        </div>
        <div className="w-[30px] flex-shrink-0 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card w-5 h-5 text-white" aria-hidden="true">
            <rect width="20" height="14" x="2" y="5" rx="2"></rect>
            <line x1="2" x2="22" y1="10" y2="10"></line>
          </svg>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* CSKH Notice */}
        <div className="bg-[#243447] rounded-lg p-4 mb-6 flex items-center justify-between border border-[#3a4a5c]">
          <div className="flex-1">
            <p className="text-sm text-white">Quý khách nạp tiền vui lòng liên hệ CSKH để được hướng dẫn nạp tiền</p>
          </div>
          <button 
            type="button"
            onClick={() => navigate('/support')}
            className="bg-[#d4af37] hover:bg-[#c19b26] text-black px-4 py-2 rounded-lg font-bold text-sm ml-4 transition-colors"
          >
            CSKH
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="mb-6">
            <p className="mb-3 text-sm text-white">Vui lòng nhập số tiền muốn nạp</p>
            <div className="relative">
              <div className="absolute text-lg text-gray-400 transform -translate-y-1/2 left-4 top-1/2">$</div>
              <input 
                {...register("money")}
                type="number" 
                placeholder="Số Tiền Nạp" 
                className="w-full bg-[#2d3a4a] border rounded-lg py-4 pl-12 pr-4 text-white placeholder-gray-400 text-lg focus:outline-none focus:border-[#d4af37] border-[#3a4a5c]" 
              />
              {errors.money && <p className="text-red-400 text-xs mt-1">{errors.money.message}</p>}
            </div>
          </div>

          <div className="mb-6 bg-[#2d3a4a] p-3 rounded-lg">
            <p className="mb-3 text-sm text-white font-bold">Tải Thông Tin Xác Thực Lên:</p>
            <div className="relative text-center rounded-lg">
              <input 
                type="file" 
                accept="image/*" 
                id="file-upload" 
                className="hidden" 
                onChange={onFileChange}
              />
              <label htmlFor="file-upload" className="block py-6 cursor-pointer">
                <div className="w-[150px] h-[100px] mx-auto bg-gray-100/10 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors duration-200 border border-white/10 overflow-hidden">
                  {preview ? (
                    <img src={preview} className="object-cover w-full h-full" alt="Preview" loading="lazy" />
                  ) : (
                    <img src="/images/cardimgw.png" className="object-contain w-12 h-12 opacity-50" alt="Upload placeholder" loading="lazy" />
                  )}
                </div>
                {!preview && <p className="text-xs text-gray-400 mt-2">Nhấn để tải ảnh</p>}
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#d4af37] hover:bg-[#c19b26] disabled:opacity-50 text-black font-bold py-4 px-6 rounded-lg transition-colors duration-200 uppercase tracking-wide shadow-lg active:scale-[0.98]"
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
