"use client"

import { useEffect, useState } from "react"
import { type User } from '@/lib/auth-store'
import { useNavigate } from "react-router-dom"

interface UserActionBarProps {
  user: User | null;
  onLogout?: () => void;
}

const languages = [
  { code: 'zh', label: '中国人', flag: '/flag/cn.png' },
  { code: 'en', label: 'English', flag: '/flag/en.png' },
  { code: 'vi', label: 'Tiếng Việt', flag: '/flag/vn.png' },
]

export function UserActionBar({ user, onLogout }: UserActionBarProps) {
  const navigate = useNavigate()
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('vi')

  useEffect(() => {
    const saved = window.localStorage.getItem('selectedLanguage')
    if (saved && languages.some((item) => item.code === saved)) {
      setSelectedLanguage(saved)
    }
  }, [])

  const currentLanguage = languages.find((item) => item.code === selectedLanguage) ?? languages[2]

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code)
    window.localStorage.setItem('selectedLanguage', code)
    setIsLangOpen(false)
  }

  const actionItems = [
    { label: 'Nạp tiền', icon: '/images/deposit.png', onClick: () => navigate('/support') },
    { label: 'Rút tiền', icon: '/images/withdraw.png', onClick: () => navigate('/transaction?view=withdraw') },
    { label: 'CSKH', icon: '/images/kefu.png', onClick: () => navigate('/support') },
    { label: 'Ngôn Ngữ', icon: '/images/language.png', onClick: () => setIsLangOpen(true) },
  ]

  return (
    <>
      <div className="flex justify-between gap-4 px-4 items-center mb-6">
        <div className="flex flex-col flex-1 truncate pr-2">
          <h2 className="text-[#ffc53e] font-black text-lg truncate leading-tight uppercase tracking-tight">
            {user?.username || user?.phone || 'Guest'}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <img src="/all/usdt_icon.png" className="h-5 w-5 flex-shrink-0" alt="USDT" loading="lazy" />
            <p className="text-[16px] text-[#ffc53e] font-black tracking-tighter">
              {(user?.money || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid flex-shrink-0 grid-cols-4 gap-2">
          {actionItems.map((item, idx) => (
            <div
              key={idx}
              onClick={item.onClick}
              className="flex flex-col items-center justify-center gap-1.5 cursor-pointer group active:scale-95 transition-all"
            >
              <img src={item.icon} className="h-9 w-auto object-contain group-hover:opacity-80 transition-opacity" alt={item.label} loading="lazy" />
              <span className="text-[#ffc53e] text-[10px] font-bold uppercase tracking-tight text-center leading-none">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {isLangOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6"
          onClick={() => setIsLangOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="language-modal-title"
            className="w-full max-w-[520px] rounded-3xl bg-[#0f1729] border border-white/10 shadow-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 id="language-modal-title" className="text-base font-bold text-white">Ngôn ngữ</h2>
              <button
                type="button"
                onClick={() => setIsLangOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg viewBox="64 64 896 896" focusable="false" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z"></path>
                </svg>
              </button>
            </div>
            <ul className="divide-y divide-white/10">
              {languages.map((language) => (
                <li
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={`flex cursor-pointer items-center gap-3 px-6 py-4 transition-colors ${selectedLanguage === language.code ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <img src={language.flag} className="h-6 w-6 rounded-full object-cover" alt={language.label} loading="lazy" />
                  <span className="text-sm font-semibold text-white">{language.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
