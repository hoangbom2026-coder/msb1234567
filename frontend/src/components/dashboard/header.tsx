import { useState, useEffect } from 'react';
import api from '@/lib/api';

export function Header() {
    const [logo, setLogo] = useState('/images/left-top-1751727228593.png');

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data } = await api.get('/config/system');
                if (data.status && data.data.site_logo) {
                    setLogo(data.data.site_logo);
                }
            } catch (error) {
                console.error('Failed to fetch config', error);
            }
        };
        fetchConfig();
    }, []);

    return (
        <div className="pt-[56px] mb-2 text-orange">
            <div className="fixed w-full max-w-[560px] top-0 left-1/2 bg-[#0c192c] -translate-x-1/2 flex justify-between items-center z-[9999999] h-[56px] overflow-hidden px-3">
                <div className="flex-shrink-0 w-[100px] h-full flex items-center">
                    <img src={logo} className="h-[40px] w-full object-contain" alt="Logo" loading="lazy" />
                </div>
                <div className="flex-1 mx-2 bg-[rgba(19,34,53,1)] rounded-lg overflow-hidden">
                    <div className="relative py-3 px-2 overflow-hidden">
                        <div className="flex whitespace-nowrap">
                            <span className="text-[#ffc53e]/60 text-sm font-medium inline-block animate-marquee">
                                Marina Bay Sands Singapore Welcome - Marina Bay Sands Singapore - Kính chào quý khách !
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
