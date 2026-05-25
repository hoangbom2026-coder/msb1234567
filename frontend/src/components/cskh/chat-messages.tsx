import { ArrowDown } from "lucide-react";

const messages = [
    {
        sender: "user",
        text: "chào bạn",
        time: ""
    },
    {
        sender: "support",
        text: "Vui lòng chờ trong giây lát. Chúng tôi sẽ trả lời bạn sớm nhất.",
        time: "05:31"
    },
    {
        sender: "user",
        text: "tôi muốn tham gia đầu tư",
        time: "05:31"
    },
    {
        sender: "user",
        text: "bạn có thể hướng dẫn tôi không",
        time: ""
    },
    {
        sender: "support",
        text: "Vui lòng chờ trong giây lát. Chúng tôi sẽ trả lời bạn sớm nhất.",
        time: "05:32"
    },
    {
        sender: "user",
        text: "huong dan toi nap tien toi khong biet nap",
        time: "05:34"
    },
    {
        sender: "user",
        text: "con toi chua chi cho toi dung",
        time: ""
    },
    {
        sender: "support",
        text: "Vui lòng chờ trong giây lát. Chúng tôi sẽ trả lời bạn sớm nhất.",
        time: "05:35"
    },
    {
        sender: "support",
        text: "Vui lòng quý khách cung cấp thông tin Tài khoản để bộ phận chăm sóc khách hàng kiểm tra giúp mình. Xin cảm ơn !",
        time: "08:08"
    },
    {
        sender: "support",
        text: `Kính gửi Quý Khách,\nVui lòng thực hiện chuyển khoản theo thông tin dưới đây:\nChủ tài khoản : DANG THI KHUYEN\nTài khoản ngân hàng: 062008556\nNgân hàng : TMCP Quốc tế Việt Nam - VIB\nTỷ giá quy đổi tạm tính: 1 USD = 27.000 VND\nSố tiền cần chuyển: ........ VND\nLưu ý quan trọng:\nSố tiền chuyển khoản tối đa cho mỗi lần giao dịch là 499.000.000 VND. Nếu vượt quá hạn mức này, vui lòng chia thành nhiều lần chuyển khoản.\nNội dung chuyển khoản:\n(ID) + cho muon tien\nSau khi hoàn tất giao dịch, Quý Khách vui lòng gửi lại hóa đơn/chứng từ chuyển khoản để chúng tôi kiểm tra và xác nhận giao dịch trên hệ thống.\nLưu ý:\nThông tin tài khoản trên chỉ có hiệu lực trong vòng 20 phút kể từ thời điểm thông báo. Quá thời gian trên, vui lòng liên hệ lại để được cấp thông tin mới.\nTrân trọng.`,
        time: ""
    },
];

export function ChatMessages() {
    return (
        <div className="flex-1 h-full overflow-hidden bg-slate-300">
            <div className="h-full w-full bg-[#FFFFFF] overflow-y-scroll chat-widget_content py-5 lg:px-5 px-2.5 relative">
                <button className="p-3 rounded-xl fixed bottom-20 right-5 bg-slate-300 shadow-2xl">
                    <ArrowDown className="text-[#36d7b7] animate-bounce text-md md:text-2xl" />
                </button>
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mt-${index > 0 ? 5 : 1}`}>
                        <div className={`flex gap-2 max-w-[70%]`}>
                            {msg.sender === 'support' && (
                                <img src="/images/default-avatar.png" alt="" className={`${index > 0 && messages[index-1].sender === 'support' ? 'opacity-0' : 'opacity-1'} rounded-full size-8 `} loading="lazy" />
                            )}
                            <div className={`flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div>
                                    <div className={`text-base py-2 px-3 text-start rounded-lg ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-[#F0F0F0] text-[#050505]'}`}>
                                        {msg.text.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                                    </div>
                                    {msg.time && <p className="text-slate-400 text-xs text-end">{msg.time}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
