import { useState, useEffect, useRef } from 'react'
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth-store"
import { useUserChat } from "@/hooks/use-user-chat"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, ChevronLeft, LoaderCircle, Image as ImageIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, isToday, isYesterday } from 'date-fns';
import api from '@/lib/api';

const QUICK_REPLIES = [
  "Nạp tiền chưa vào tài khoản",
  "Lỗi khi thực hiện rút tiền",
  "Hỏi về chương trình khuyến mãi",
  "Tài khoản bị khóa",
];

export default function SupportPage() {
  const [input, setInput] = useState('')
  const [uploading, setUploading] = useState(false);
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, loading, isConnected, sendMessage } = useUserChat();

  const handleSend = (text?: string) => {
    const messageToSend = text || input;
    if (!messageToSend.trim()) return;
    sendMessage(messageToSend);
    setInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('chat', file);

      const res = await api.post(isLoggedIn ? '/user/chat/upload' : '/user/chat/upload/guest', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.status) {
        sendMessage(res.data.data.url);
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  const isImage = (text: string) => {
    return text.includes('/uploads/chat/') || !!text.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i);
  };

  const renderDateSeparator = (date: string, index: number) => {
    if (index === 0) return true;
    const prevDate = new Date(messages[index - 1].created_at);
    const currDate = new Date(date);
    return prevDate.toDateString() !== currDate.toDateString();
  };

  const formatDateLabel = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return 'Hôm nay';
    if (isYesterday(d)) return 'Hôm qua';
    return format(d, 'dd/MM/yyyy');
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-56px)] bg-[#0c192c] text-white overflow-hidden">
      {/* Chat Content */}
      <div className="flex-1 overflow-hidden relative pt-4">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6 min-h-full flex flex-col justify-end">
            <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-4 text-[11px] text-yellow-500 font-bold text-center">
                BẠN ĐANG TRÒ CHUYỆN VỚI TƯ CÁCH KHÁCH. ĐĂNG NHẬP ĐỂ LƯU LỊCH SỬ LÂU DÀI.
            </div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <LoaderCircle className="w-8 h-8 animate-spin mb-3 text-primary" />
                <p className="text-xs font-bold uppercase tracking-tighter opacity-50">Đang tải lịch sử...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <Send className="text-primary w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-white/50">Xin chào! Chúng tôi có thể giúp gì cho bạn?</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const sender_role = (msg as any).sender_role;
                const isUserSide = sender_role === 'user' || sender_role === 'guest';
                const showDate = renderDateSeparator(msg.created_at, idx);

                return (
                  <div key={msg.id} className="space-y-4">
                    {showDate && (
                      <div className="flex justify-center my-6">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 text-white/40 px-3 py-1 rounded-full">
                          {formatDateLabel(msg.created_at)}
                        </span>
                      </div>
                    )}
                    <div className={cn("flex gap-3", isUserSide ? "flex-row-reverse" : "flex-row")}>
                      <div className="w-8 h-8 shrink-0 rounded-full bg-white/10 flex items-center justify-center border border-white/10 overflow-hidden">
                        {isUserSide ? (
                          <img src={user?.avatar || "/images/default-avatar.png"} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <img src="/images/customer-service-agent.png" className="w-full h-full object-cover p-1" loading="lazy" />
                        )}
                      </div>
                      <div className={cn("flex flex-col max-w-[75%] space-y-1", isUserSide ? "items-end" : "items-start")}>
                        <div className={cn(
                          "p-3 rounded-2xl text-[13px] shadow-lg leading-relaxed",
                          isUserSide
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-[#171c25] text-gray-200 rounded-tl-none border border-white/5"
                        )}>
                          {isImage(msg.message) ? (
                            <div className="rounded-lg overflow-hidden border border-white/10">
                              <img
                                src={msg.message.startsWith('/') ? msg.message : msg.message}
                                alt="Chat image"
                                className="max-w-full max-h-60 object-contain cursor-pointer"
                                onClick={() => window.open(msg.message, '_blank')}
                              />
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                          )}
                        </div>
                        <span className="text-[9px] font-bold opacity-30 px-1">
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Quick Replies */}
      {!loading && (
        <div className="bg-[#0c192c] border-t border-white/5 py-3 px-3">
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 custom-scrollbar-hide no-scrollbar">
            {QUICK_REPLIES.map((reply, i) => (
              <button
                key={i}
                onClick={() => handleSend(reply)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-tight px-4 py-2 rounded-full transition-all active:scale-95"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-[#132235] p-3 pb-8 border-t border-white/10">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-10 h-10 shrink-0 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
          >
            {uploading ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <ImageIcon size={20} className="text-primary" />}
          </button>

          <textarea
            rows={1}
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 bg-white/5 border border-white/10 text-white py-2.5 px-4 rounded-2xl outline-none focus:border-primary/50 transition-all resize-none text-[13px] no-scrollbar overflow-hidden"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || !isConnected}
            className="w-10 h-10 shrink-0 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
