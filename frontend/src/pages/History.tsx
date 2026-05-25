import { BetHistoryView } from "@/components/account/bet-history-view"
import { useNavigate } from "react-router-dom"

export default function HistoryPage() {
  const navigate = useNavigate();
  return (
    <div className="bg-[#0b0f17] min-h-screen">
      <BetHistoryView onBack={() => navigate(-1)} />
    </div>
  )
}
