"use client"

import { cn } from "@/lib/utils"

interface TabOption {
  id: string
  label: string
}

interface FilterTabsProps {
  options: TabOption[]
  activeTab: string
  onTabChange: (id: string) => void
  className?: string
}

export function FilterTabs({ 
  options, 
  activeTab, 
  onTabChange, 
  className 
}: FilterTabsProps) {
  return (
    <div className={cn(
      "flex max-w-full gap-2 py-2 pb-2 mb-2 overflow-x-auto no-scrollbar scroll-smooth",
      className
    )}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onTabChange(option.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm min-w-fit font-medium transition-all",
            activeTab === option.id 
              ? "text-white bg-gradient-to-b from-[#13a2ba] to-[#087c95] shadow-md" 
              : "bg-[#2c5c61] text-gray-400 hover:bg-gray-200 hover:text-white"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
