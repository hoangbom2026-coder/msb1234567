"use client"

import { cn } from "@/lib/utils"

export function AccountHeader({ title, onBack, rightIcon }: { title: string, onBack: () => void, rightIcon?: React.ReactNode }) {
  return (
    <div className="h-[44px] w-full flex items-center px-2.5 border-b border-white/5 sticky top-0 bg-[#0b0f17] z-50">
      <div 
        className="w-[30px] flex-shrink-0 flex items-center justify-start cursor-pointer"
        onClick={onBack}
      >
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" className="text-white" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
          <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"></path>
        </svg>
      </div>
      <div className="w-full flex-1 flex justify-center items-center text-xl text-white h-full font-medium">
        <p className="leading-none">{title}</p>
      </div>
      <div className="w-[30px] flex-shrink-0 flex items-center justify-end text-white">
        {rightIcon}
      </div>
    </div>
  )
}

export function AccountCard({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("bg-white py-[10px] rounded-[8px] px-[15px] shadow-xl", className)}>
      {children}
    </div>
  )
}

export function AccountInput({ 
  label, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  rightElement 
}: { 
  label?: string, 
  type?: string, 
  placeholder?: string, 
  value: string, 
  onChange: (val: string) => void,
  rightElement?: React.ReactNode
}) {
  return (
    <div className="relative">
      <div className="flex flex-col w-full">
        {label && <label className="font-[500] text-[rgb(50,50,51)] text-[12px] mb-1">{label}</label>}
        <div className="relative flex items-center border-b border-gray-200">
          <input 
            type={type} 
            placeholder={placeholder} 
            className="w-full py-2 text-[14px] !text-black placeholder:text-gray-400 bg-transparent outline-none pr-[40px]"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {rightElement && (
            <div className="absolute right-0 cursor-pointer text-[#7F888B]">
              {rightElement}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function AccountButton({ 
  children, 
  onClick, 
  disabled, 
  className,
  type = "button"
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  disabled?: boolean,
  className?: string,
  type?: "button" | "submit" | "reset"
}) {
  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full bg-[#FFC53E] text-black text-lg font-bold h-[46px] rounded-md flex justify-center items-center gap-2 active:scale-95 transition-all shadow-md disabled:bg-gray-200 disabled:text-gray-400",
        className
      )}
    >
      {children}
    </button>
  )
}
