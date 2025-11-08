'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/use-auth';
import { PinnedTemplates } from '@/app/journal/components/pinned-templates';
import { Quote } from '@/components/ui/quote';
import { RoleplayCard } from '@/app/roleplay/components/roleplay-card';
import { QuickReview } from '@/app/homepage/components/quick-review';
// Giả sử đường dẫn này đúng, nếu không bạn cần điều chỉnh
import { supabase } from '@/services/supabase/client'; 

// Định nghĩa kiểu dữ liệu cho kịch bản nhập vai dựa trên cột Supabase
interface RoleplayScenario {
    id: string; 
    name: string;      // Tên cột mới: 'name'
    context: string;   // Tên cột mới: 'context'
    image: string | null; // Tên cột mới: 'image'
}

const quotes = [
    { text: 'Tâm hồn ta được nhuộm bởi màu sắc của những suy nghĩ chính mình.', author: 'Marcus Aurelius' },
    { text: 'Tâm trí sẽ trở thành hình dạng của những gì nó thường xuyên nghĩ đến.', author: 'Marcus Aurelius' },
    { text: 'Càng viết nhiều, bạn càng hiểu rõ điều mình nghĩ.', author: 'Marty Rubin' },
    { text: 'Muốn trở thành người viết, hãy đọc thật nhiều và viết thật nhiều.', author: 'Stephen King' },
];

export default function DashboardPage() {
    const { user } = useAuth();
    const today = new Date();
    const quote = quotes[today.getDate() % quotes.length];
    
    // Sử dụng kiểu dữ liệu đã định nghĩa
    const [scenarios, setScenarios] = useState<RoleplayScenario[]>([]); 
    const [loading, setLoading] = useState(true);

    // 🧠 Fetch roleplay từ Supabase
    useEffect(() => {
        async function fetchScenarios() {
            const { data, error } = await supabase
                .from('roleplay_scenario') // Tên bảng
                // ❗ Đã điều chỉnh tên cột theo schema bạn cung cấp
                .select('id, name, context, image') 
                .order('created_at', { ascending: false })
                .limit(3);

            if (error) {
                console.error('❌ Lỗi khi tải roleplay:', error.message);
                setScenarios([]); // Đặt về mảng rỗng khi có lỗi
            } else {
                // Ép kiểu dữ liệu nếu cần
                setScenarios(data as RoleplayScenario[]);
            }
            setLoading(false);
        }

        fetchScenarios();
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        // 💡 THAY ĐỔI 1: Container cha
        // - h-screen: Bắt buộc container cha cao 100% viewport
        // - overflow-y-auto: Cho phép container này cuộn
        // - snap-y snap-mandatory: Kích hoạt scroll-snap theo chiều dọc (y)
        //   và bắt buộc (mandatory) nó phải "hút" vào 1 điểm
        <div className="h-screen overflow-y-auto scroll-smooth snap-y snap-mandatory scrollbar-none [&::-webkit-scrollbar]:hidden">
            {/* SECTION 1 – VIẾT */}
            {/* 💡 THAY ĐỔI 2: Thêm "snap-start" */}
            {/* - snap-start: Đánh dấu đây là một điểm "hút", căn lề trên cùng */}
            <section 
                id="viet" 
                className="h-screen flex flex-col justify-center bg-gradient-to-b from-gray-50 to-blue-50/40 snap-start"
            >
                <div className="text-center space-y-6 px-4">
                    <h1 className="text-3xl font-semibold text-gray-800">
                        Chào bạn, {user?.email?.split('@')[0] || 'người học tiếng Anh'} 🌿
                    </h1>
                    <p className="text-gray-600 text-lg">Dành chút thời gian để viết và lắng nghe chính mình hôm nay.</p>

                    <div className="max-w-3xl mx-auto">
                        <PinnedTemplates />
                    </div>

                    <Quote text={quote.text} author={quote.author} />

                    <button
                        aria-label="Cuộn xuống phần học"
                        onClick={() => scrollTo('hoc')}
                        className="mt-8 mx-auto flex items-center justify-center p-3 rounded-full bg-white/70 shadow hover:bg-white transition-all animate-bounce"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                            <path d="M12 5v14" />
                            <path d="m19 12-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </section>

            {/* SECTION 2 – HỌC */}
            {/* 💡 THAY ĐỔI 3: Điều chỉnh Section 2 */}
            {/* - snap-start: Đánh dấu đây là điểm "hút" thứ hai */}
            {/* - justify-start: Bỏ "justify-center" và thay bằng "start" để nội dung bắt đầu từ trên */}
            {/* - overflow-y-auto: (Quan trọng) Cho phép NỘI DUNG BÊN TRONG section này cuộn 
                                nếu nó dài hơn màn hình (ví dụ trên mobile) mà không làm hỏng layout. */}
            {/* - pt-16 pb-8: Thêm padding trên/dưới cho đẹp mắt vì không còn căn giữa nữa */}
            <section 
                id="hoc" 
                className="min-h-screen flex flex-col justify-start bg-gradient-to-b from-blue-50/40 to-white snap-start pt-16 pb-8"
            >
                {/* Đã thêm max-w-6xl và px-4... vào đây để giới hạn nội dung */}
                <div className="max-w-6xl mx-auto px-4 space-y-8 w-full"> 
                    {/* Roleplay Section */}
                    <div className="bg-white shadow rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">🎭 Luyện hội thoại hôm nay</h2>
                            <Link href="/roleplay" className="text-blue-600 text-sm hover:underline">
                                Xem tất cả
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {loading ? (
                                <p className="text-gray-500 text-center col-span-3">Đang tải dữ liệu hội thoại...</p>
                            ) : scenarios.length > 0 ? (
                                scenarios.map((s) => (
                                    <RoleplayCard
                                        key={s.id}
                                        id={s.id}
                                        // ❗ Đã điều chỉnh tên props để phù hợp với component RoleplayCard
                                        title={s.name}       // Map từ 'name'
                                        description={s.context} // Map từ 'context'
                                        imageUrl={s.image || ''} // Map từ 'image' và đảm bảo là string
                                    />
                                ))
                            ) : (
                                <p className="text-gray-500 text-center col-span-3">Chưa có hội thoại nào được thêm.</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Review */}
                    <div className="bg-white shadow rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">📘 Ôn từ vựng nhanh</h2>
                            <Link href="/vocab" className="text-blue-600 text-sm hover:underline">
                                Tới Vocab Hub
                            </Link>
                        </div>
                        <QuickReview count={5} />
                    </div>

                    {/* Nút cuộn lên */}
                    <div className="flex justify-center">
                        <button
                            aria-label="Cuộn lên phần viết"
                            onClick={() => scrollTo('viet')}
                            className="mt-4 p-3 rounded-full bg-white/70 shadow hover:bg-white transition-all animate-bounce"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 rotate-180">
                                <path d="M12 5v14" />
                                <path d="m19 12-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}