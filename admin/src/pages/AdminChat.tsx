import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Send,
  User,
  CheckCheck,
  LoaderCircle,
  RefreshCw,
  Image as ImageIcon,
  MoreVertical,
  Circle,
  Paperclip,
  ChevronLeft,
  Pencil,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdminChat, Conversation, Message } from '@/hooks/use-admin-chat';
import { format } from 'date-fns';
import { useState, useEffect, useRef } from 'react';
import { adminApi } from '@/lib/admin-api';

const isImageMessage = (text: string) => {
  return text.includes('/uploads/chat/') || !!text.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i);
};

const ConversationItem = ({ conversation, isActive, onClick }: { conversation: Conversation; isActive: boolean; onClick: () => void; }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b text-left",
      isActive && "bg-slate-50 dark:bg-slate-800 shadow-inner border-l-4 border-l-primary"
    )}
  >
    <div className="relative shrink-0">
      <div className="h-10 w-10 rounded-sm bg-primary/10 border border-primary/5 flex items-center justify-center overflow-hidden">
        {conversation.avatar ? (
          <img src={conversation.avatar} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <User className="h-6 w-6 text-primary" />
        )}
      </div>
      {conversation.online && (
        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background shadow-sm" />
      )}
    </div>
    <div className="flex-1 min-w-0 flex flex-col justify-center">
      <div className="flex justify-between items-baseline mb-0.5">
        <span className="font-bold truncate text-[11px] dark:text-white uppercase">
          {conversation.user_name || (conversation.guest_id ? `KHÁCH: ${conversation.guest_id.substring(0, 8)}` : 'N/A')}
        </span>
        <span className="text-[10px] font-bold text-slate-400">
          {format(new Date(conversation.last_message_time), 'HH:mm')}
        </span>
      </div>
      <div className="flex justify-between items-center gap-2">
        <p className={cn(
          "text-[11px] truncate flex-1 leading-none font-medium",
          conversation.has_unread_user_messages ? "text-slate-800 dark:text-white" : "text-slate-400"
        )}>
          {conversation.last_message}
        </p>
        {conversation.guest_id && !conversation.user_id && <Badge variant="outline" className="text-[8px] h-3.5 px-1 border-yellow-500/50 text-yellow-600 bg-yellow-50 flex items-center shrink-0">GUEST</Badge>}
        {conversation.has_unread_user_messages && (
          <div className="h-2 w-2 rounded-full bg-red-500 shadow-sm animate-pulse shrink-0" />
        )}
      </div>
    </div>
  </button>
);

const ChatMessage = ({ message, onEdit, onDelete }: { message: Message; onEdit: (id: number | string, newText: string) => void; onDelete: (id: number | string) => void; }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.message);

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent !== message.message) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col max-w-[85%] sm:max-w-[80%] space-y-1 mb-4 group relative",
        message.sender_role === 'admin' ? "ml-auto items-end" : "items-start"
      )}
    >
      <div className={cn("flex items-end gap-2", message.sender_role === 'admin' ? "flex-row-reverse" : "flex-row")}>
        <div
          className={cn(
            "px-3 py-2 sm:px-4 sm:py-2.5 rounded-sm text-[12px] sm:text-[13px] shadow-sm font-medium leading-relaxed relative",
            message.sender_role === 'admin'
              ? "bg-primary text-black"
              : "bg-white dark:bg-slate-900 border border-border text-slate-800 dark:text-white"
          )}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2 min-w-[200px]">
              <textarea 
                className="w-full text-black bg-white/90 rounded p-1 text-xs focus:outline-none resize-none"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
                rows={3}
              />
              <div className="flex justify-end gap-1">
                <button onClick={() => { setIsEditing(false); setEditContent(message.message); }} className="p-1 rounded hover:bg-black/10"><X size={12} /></button>
                <button onClick={handleEditSubmit} className="p-1 rounded hover:bg-black/10 text-emerald-700"><Check size={12} /></button>
              </div>
            </div>
          ) : isImageMessage(message.message) ? (
            <div className="rounded-sm overflow-hidden border border-border">
              <img
                src={message.message}
                alt="Chat image"
                className="max-w-full max-h-60 object-contain cursor-pointer"
                onClick={() => window.open(message.message, '_blank')}
              />
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.message}</p>
          )}
        </div>

        {message.sender_role === 'admin' && !isEditing && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 shrink-0">
            <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-sm shadow-sm">
              <Pencil size={12} />
            </button>
            <button onClick={() => { if(confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) onDelete(message.id); }} className="p-1.5 text-red-400 hover:text-red-500 bg-red-50 dark:bg-red-950/30 rounded-sm shadow-sm">
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 px-1 opacity-60">
        <span className="text-[9px] font-bold text-slate-400">{format(new Date(message.created_at), 'HH:mm')}</span>
        {message.sender_role === 'admin' && <CheckCheck size={10} className="text-primary" />}
      </div>
    </div>
  );
};

const ChatWindow = ({ conversation, messages, onSendMessage, onEditMessage, onDeleteMessage, onBack }: { conversation: Conversation; messages: Message[]; onSendMessage: (text: string) => void; onEditMessage: (id: number | string, newText: string) => void; onDeleteMessage: (id: number | string) => void; onBack: () => void; }) => {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight });
      }
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('chat', file);
      const res = await adminApi.uploadChatImage(formData);
      if (res.status) {
        onSendMessage(res.data.url);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="flex-1 flex flex-col min-w-0 shadow-sm border-border rounded-sm overflow-hidden bg-white dark:bg-[#0a0f18]/50 h-full">
      <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
          <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden shrink-0" onClick={onBack}>
            <ChevronLeft size={20} />
          </Button>
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-sm bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            {conversation.avatar ? (
              <img src={conversation.avatar} className="w-full h-full object-cover rounded-sm" loading="lazy" />
            ) : (
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            )}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white uppercase leading-none mb-1 sm:mb-1.5 truncate">{conversation.user_name}</h3>
            <div className="flex items-center gap-2 sm:gap-3">
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none truncate">
                {conversation.user_phone || `GUEST: ${conversation.guest_id?.substring(0, 8)}`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-slate-400 hover:text-primary rounded-sm"><RefreshCw size={14} /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-slate-400 rounded-sm"><MoreVertical size={14} /></Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollAreaRef}>
        <div className="flex flex-col">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} onEdit={onEditMessage} onDelete={onDeleteMessage} />
          ))}
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-20">
              <User size={40} />
              <p className="text-xs font-bold uppercase mt-4 tracking-widest">Bắt đầu hội thoại hỗ trợ</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 sm:p-4 border-t bg-slate-50 dark:bg-slate-900/50">
        <form className="flex gap-2 sm:gap-3 items-center" onSubmit={handleSubmit}>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
          <Button type="button" variant="outline" size="icon" className="shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-sm border-border" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <LoaderCircle className="animate-spin h-4 w-4 sm:h-5 sm:w-5" /> : <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500" />}
          </Button>
          <Input 
             value={text} 
             onChange={e => setText(e.target.value)} 
             placeholder="Nhập tin nhắn..." 
             className="flex-1 h-10 sm:h-11 rounded-sm border-border font-medium text-sm focus-visible:ring-primary/20" 
          />
          <Button type="submit" className="shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-sm bg-primary text-black hover:bg-primary/90" disabled={!text.trim()}>
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default function AdminChatPage() {
  const { conversations, messages, activeConversation, selectConversation, sendMessage, editMessage, deleteMessage, loading } = useAdminChat();
  const [searchTerm, setSearchText] = useState('');

  const filteredConversations = conversations.filter(c => 
    c.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.user_phone?.includes(searchTerm) ||
    c.guest_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 h-[calc(100vh-64px)] md:h-[calc(100vh-100px)] flex flex-col md:flex-row gap-2 md:gap-4 font-['Inter']">
        <Card className={cn(
          "w-full md:w-80 flex flex-col shrink-0 shadow-sm border-border rounded-sm overflow-hidden bg-white dark:bg-[#0a0f18]/50 transition-all duration-300",
          activeConversation ? "hidden md:flex" : "flex"
        )}>
          <CardHeader className="p-3 sm:p-4 border-b bg-slate-50 dark:bg-slate-900/20">
            <div className="relative">
              <Input
                placeholder="Tìm tên hoặc SĐT..."
                className="h-10 rounded-sm bg-white dark:bg-slate-900 border-border font-medium text-[11px]"
                value={searchTerm}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {loading && conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-4">Đang tải...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-20 opacity-30">
                  <Search className="h-8 w-8 mx-auto mb-3" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Không tìm thấy</p>
                </div>
              ) : (
                filteredConversations.map((chat) => (
                  <ConversationItem
                    key={chat.id}
                    conversation={chat}
                    isActive={activeConversation?.id === chat.id}
                    onClick={() => selectConversation(chat)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {}
        <div className={cn(
          "flex-1 flex-col h-full transition-all duration-300",
          activeConversation ? "flex" : "hidden md:flex"
        )}>
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              messages={messages}
              onSendMessage={sendMessage}
              onEditMessage={editMessage}
              onDeleteMessage={deleteMessage}
              onBack={() => selectConversation(null as any)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/20 rounded-sm border border-dashed border-border">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 border border-border">
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-slate-300" />
              </div>
              <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-slate-400">CHƯA CHỌN PHIÊN</h3>
              <p className="text-[9px] sm:text-[11px] font-medium text-slate-400 mt-2 uppercase">Chọn một khách hàng để bắt đầu</p>
            </div>
          )}
        </div>
    </div>
  );
}
