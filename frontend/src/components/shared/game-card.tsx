import React from 'react';
import { cn } from '@/lib/utils';

interface GameCardProps {
    name: string;
    imageUrl: string;
    onClick: () => void;
    className?: string;
}

export const GameCard: React.FC<GameCardProps> = ({ name, imageUrl, onClick, className }) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex flex-col items-center cursor-pointer group active:scale-95 transition-all duration-300",
                className
            )}
        >
            <div className="relative mb-2 w-full aspect-square overflow-hidden rounded-xl border border-white/5 ring-1 ring-white/10 shadow-xl group-hover:shadow-2xl group-hover:ring-white/20 transition-all">
                <img
                    src={imageUrl || '/images/listgame/cp2img1.png'}
                    loading="lazy"
                    onError={(e: any) => { 
                        e.target.onerror = null; 
                        e.target.src = '/images/listgame/cp2img1.png'; 
                    }}
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    alt={name}
                />
            </div>
            <span className="text-center text-[#ffc53e] font-black text-[11px] leading-tight uppercase tracking-tight line-clamp-2 px-1">
                {name}
            </span>
        </div>
    );
};
