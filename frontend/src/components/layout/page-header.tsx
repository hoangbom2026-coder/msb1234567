import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  onBack?: () => void
  rightElement?: React.ReactNode
  className?: string
  showBottomBorder?: boolean
}

export function PageHeader({ 
  title, 
  onBack, 
  rightElement, 
  className,
  showBottomBorder = false
}: PageHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <div className={cn(
      "h-[44px] w-full flex items-center px-2.5 flex-shrink-0 sticky top-0 z-50 bg-inherit",
      showBottomBorder ? "border-b border-white/5" : "shadow-[0_1px_6px_#132235] !shadow-none",
      className
    )}>
      <div 
        className="w-[30px] flex-shrink-0 flex items-center justify-start cursor-pointer"
        onClick={handleBack}
      >
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" className="text-white" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
          <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"></path>
        </svg>
      </div>
      <div className="w-full flex-1 flex justify-center items-center text-xl text-white h-full font-medium">
        <p className="leading-none">{title}</p>
      </div>
      <div className="w-[30px] flex-shrink-0 flex items-center justify-end">
        {rightElement}
      </div>
    </div>
  )
}
