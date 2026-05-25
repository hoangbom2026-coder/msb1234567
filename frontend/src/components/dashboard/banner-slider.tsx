"use client"

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export function BannerSlider() {
  const [banners, setBanners] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await api.get('/game/banners');
        if (data.status) {
          setBanners(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch banners', error);
        // Fallback banner if API fails
        setBanners([{ id: 'default', image_url: '/home/banner22.png' }]);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  if (loading || banners.length === 0) {
    return (
      <div className="w-full aspect-[2/1] bg-muted animate-pulse rounded-b-xl" />
    )
  }

  return (
    <div className="relative w-full aspect-[2/1] overflow-hidden">
      <div 
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, idx) => (
          <img 
            key={banner.id || idx} 
            src={banner.image_url} 
            alt={`Banner ${idx}`} 
            className="w-full h-full object-cover shrink-0" 
            loading="lazy"
          />
        ))}
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {banners.map((_, idx) => (
          <div 
            key={idx} 
            className={`w-1.5 h-1.5 rounded-full transition-all ${currentIndex === idx ? 'bg-primary w-4' : 'bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  )
}
