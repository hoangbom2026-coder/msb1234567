import { Paperclip, Mic, Send, SmilePlus } from 'lucide-react';

export function ChatInput() {
    return (
        <div className="flex-shrink-0 h-auto">
            <div className="w-full flex justify-center items-start bg-white flex-shrink-0 lg:px-5 px-2.5 relative">
                <div className="w-full flex gap-1 md:gap-3 items-end pt-1 pb-2.5">
                    <div className="flex-1 w-full rounded-[20px] bg-[#F0F2F5] py-2 px-2.5 lg:px-5 lg:py-2.5 border border-transparent">
                        <div className="relative">
                            <div contentEditable="true" className="w-full focus:outline-none text-left break-all max-h-[70px] overflow-y-auto leading-tight min-h-[20px]"></div>
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 text-gray-500 pointer-events-none">Enter message</div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 mb-2 flex items-center gap-2 md:gap-5">
                        <SmilePlus className="cursor-pointer text-[#555] hover:text-primary text-[22px] md:text-2xl" />
                        <div>
                            <input accept="image/*,video/*" className="form-control hidden !h-0 !w-0 !opacity-0" type="file" id="file-input" />
                            <label htmlFor="file-input" className="block w-fit">
                                <Paperclip className="cursor-pointer text-[#555] hover:text-primary" height={22} width={22} />
                            </label>
                        </div>
                        <Mic className="relative z-10 text-[#555555]" height={20} width={20} />
                        <button disabled className="transition-colors text-gray-400">
                            <Send className="text-2xl md:text-3xl" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
