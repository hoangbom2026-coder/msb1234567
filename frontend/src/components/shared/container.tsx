import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'outline' | 'glass';
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, variant = 'default', onClick }) => {
    const variants = {
        default: 'bg-[#171c25] border border-white/5',
        outline: 'border border-white/10 bg-transparent',
        glass: 'bg-white/5 backdrop-blur-md border border-white/10'
    };

    return (
        <div 
            onClick={onClick}
            className={cn(
                "rounded-xl overflow-hidden shadow-lg transition-all",
                variants[variant],
                className
            )}
        >
            {children}
        </div>
    );
};

export const Section: React.FC<{ children: React.ReactNode, title?: string, className?: string }> = ({ children, title, className }) => {
    return (
        <section className={cn("px-4 mb-6", className)}>
            {title && (
                <h3 className="text-[#ffc53e] font-black text-xs uppercase tracking-widest mb-3 px-1">
                    {title}
                </h3>
            )}
            {children}
        </section>
    );
};
