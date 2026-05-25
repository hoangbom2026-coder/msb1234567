import { ChevronLeft, Phone, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ChatHeader() {
    return (
        <div className="w-full flex justify-between h-[55px] px-3 md:px-5 bg-primary text-white ">
            <div className="flex items-center gap-3 md:gap-5 cursor-pointer">
                <Link to="/">
                    <ChevronLeft className="size-[20px] md:size-[25px]" />
                </Link>
            </div>
            <div className="flex items-center justify-center cursor-pointer">
                <img src="/images/default-avatar.png" alt="" className="rounded-full size-10 " loading="lazy" />
                <p className="ml-2 font-bold">QuangCSKH</p>
            </div>
            <div className="flex gap-3 items-center justify-end cursor-pointer">
                <button>
                    <Phone className="size-[20px] md:size-[25px]" />
                </button>
                <button>
                    <MoreVertical className="size-[20px] md:size-[25px]" />
                </button>
            </div>
        </div>
    );
}
