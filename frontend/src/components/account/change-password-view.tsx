import { useState } from 'react'
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"

export function ChangePasswordView({ onBack }: { onBack: () => void }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleUpdate = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ variant: "destructive", title: "Lỗi", description: "Mật khẩu phải có ít nhất 6 ký tự." })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Lỗi", description: "Mật khẩu xác nhận không khớp." })
      return
    }

    setLoading(true)
    try {
      const response = await api.put('/user/change/password-direct', {
        newPassword: newPassword
      })

      if (response.data && response.data.status) {
        toast({ title: "Thành công", description: "Cập nhật mật khẩu đăng nhập thành công." })
        onBack()
      } else {
        toast({ variant: "destructive", title: "Lỗi", description: response.data?.message || "Cập nhật thất bại" })
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể kết nối đến máy chủ" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] flex flex-col flex-1 pb-10">
      <div className="h-[44px] w-full flex mb-5 shadow-[0_1px_6px_#132235] px-2.5 flex-shrink-0 !shadow-none">
        <div className="w-[30px] flex-shrink-0 flex items-center justify-start cursor-pointer" onClick={onBack}>
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" className="text-white" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"></path>
          </svg>
        </div>
        <div className="w-full flex-1 flex justify-center items-center text-xl text-white h-full">
          <p className="leading-none">Thay đổi mật khẩu</p>
        </div>
        <div className="w-[30px] flex-shrink-0 flex items-center"></div>
      </div>

      <div className="px-2.5">
        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
          <div className="bg-white py-[10px] rounded-[8px] px-[15px]">
            <div className="grid gap-y-6">
              
              <div className="relative">
                <div className="flex flex-col w-full">
                  <label className="text-[rgb(50,50,51)] block font-[500] border-0 px-0 text-[12px] mb-0">Mật khẩu đăng nhập</label>
                  <div className="text-[#989898] flex gap-1 relative px-0 mt-2">
                    <input 
                      id="newPassword" 
                      placeholder="Vui lòng nhập mật khẩu đăng nhập của bạn" 
                      name="newPassword" 
                      autoComplete="new-password" 
                      type={showPass ? "text" : "password"} 
                      className="w-full focus:outline-none bg-transparent text-[14px] h-[23px] px-0 !text-black pr-[40px] placeholder-[#989898]" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={() => setShowPass(!showPass)}>
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" className="text-[#7F888B]" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M288 144a110.94 110.94 0 0 0-31.24 5 55.4 55.4 0 0 1 7.24 27 56 56 0 0 1-56 56 55.4 55.4 0 0 1-27-7.24A111.71 111.71 0 1 0 288 144zm284.52 97.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400c-98.65 0-189.09-55-237.93-144C98.91 167 189.34 112 288 112s189.09 55 237.93 144C477.1 345 386.66 400 288 400z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="border-b border-gray-200 mt-2"></div>
                </div>
              </div>

              <div className="relative">
                <div className="flex flex-col w-full">
                  <label className="text-[rgb(50,50,51)] block font-[500] border-0 px-0 text-[12px] mb-0">Xác nhận mật khẩu đăng nhập</label>
                  <div className="text-[#989898] flex gap-1 relative px-0 mt-2">
                    <input 
                      id="cNewPassword" 
                      placeholder="Vui lòng nhập lại mật khẩu đăng nhập để xác nhận" 
                      name="cNewPassword" 
                      autoComplete="new-password" 
                      type={showPass ? "text" : "password"} 
                      className="w-full focus:outline-none bg-transparent text-[14px] h-[23px] px-0 !text-black pr-[40px] placeholder-[#989898]" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={() => setShowPass(!showPass)}>
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" className="text-[#7F888B]" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M288 144a110.94 110.94 0 0 0-31.24 5 55.4 55.4 0 0 1 7.24 27 56 56 0 0 1-56 56 55.4 55.4 0 0 1-27-7.24A111.71 111.71 0 1 0 288 144zm284.52 97.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400c-98.65 0-189.09-55-237.93-144C98.91 167 189.34 112 288 112s189.09 55 237.93 144C477.1 345 386.66 400 288 400z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="border-b border-gray-200 mt-2"></div>
                </div>
              </div>

            </div>

            <div className="mt-8">
              <button 
                type="submit" 
                disabled={loading}
                className="text-black text-lg font-bold h-[46px] rounded-md w-full flex justify-center items-center gap-2 disabled:bg-[#F2F2F2] disabled:text-[#989898] disabled:cursor-not-allowed bg-[#FFC53E]"
              >
                <span>{loading ? "Đang xử lý..." : "Xác nhận"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
