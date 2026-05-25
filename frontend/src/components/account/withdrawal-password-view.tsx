import { useState } from 'react'
import { Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { AccountHeader, AccountCard, AccountInput, AccountButton } from "./shared-ui"

export function WithdrawalPasswordView({ onBack }: { onBack: () => void }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Lỗi", description: "Mật khẩu không khớp" })
      return
    }

    setLoading(true)
    try {
      const response = await api.put('/user/change/password-transaction', {
        passwordV2: newPassword
      })

      if (response.data && response.data.status) {
        toast({ title: "Thành công", description: "Cập nhật mật khẩu thanh toán thành công." })
        onBack()
      } else {
        toast({ variant: "destructive", title: "Lỗi", description: response.data?.message || "Cập nhật thất bại" })
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Lỗi kết nối", description: err.response?.data?.message || "Không thể kết nối đến máy chủ" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] max-w-[560px] mx-auto bg-[#0b0f17]">
      <AccountHeader title="Mật khẩu thanh toán" onBack={onBack} />

      <div className="px-[12px] mt-4">
        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
          <AccountCard className="space-y-6">
            <AccountInput 
              label="Mật khẩu thanh toán"
              type={showNew ? "text" : "password"}
              placeholder="Xin mời nhập mật khẩu thanh toán"
              value={newPassword}
              onChange={setNewPassword}
              rightElement={
                <div onClick={() => setShowNew(!showNew)}>
                  {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              }
            />

            <AccountInput 
              label="Xác nhận mật khẩu"
              type={showConfirm ? "text" : "password"}
              placeholder="Vui lòng nhập lại mật khẩu thanh toán"
              value={confirmPassword}
              onChange={setConfirmPassword}
              rightElement={
                <div onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              }
            />

            <div className="mt-8">
              <AccountButton 
                disabled={!newPassword || !confirmPassword || loading}
                type="submit"
              >
                {loading ? "Đang xử lý..." : "Xác nhận"}
              </AccountButton>
            </div>
          </AccountCard>
        </form>
      </div>
    </div>
  )
}
